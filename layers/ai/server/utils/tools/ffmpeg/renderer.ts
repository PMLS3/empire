import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// FFmpeg must be installed on the server
const FFMPEG_PATH = process.env.FFMPEG_PATH || 'ffmpeg';

// Storage directories
const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'videos');

// Create directories if they don't exist
async function ensureDirectoriesExist() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

/**
 * Interface for video assets
 */
interface VideoAsset {
  id: string;
  type: 'video' | 'image';
  url: string;
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
  effects?: any[]; // Effects to apply
}

/**
 * Interface for audio assets
 */
interface AudioAsset {
  id: string;
  url: string;
  start: number; // Start time in seconds
  duration: number; // Duration in seconds
  volume: number; // 0-100
}

/**
 * Render a video from provided assets
 */
export async function renderVideo(
  settings: any,
  videoAssets: VideoAsset[],
  audioAssets: AudioAsset[],
  outputFormat: string = 'mp4',
  onProgress?: (progress: number) => Promise<void>
): Promise<{ url: string; duration: number }> {
  // Ensure directories exist
  await ensureDirectoriesExist();
  
  // Generate a unique output filename
  const outputFilename = `${uuidv4()}.${outputFormat}`;
  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  
  // Create a temporary file for the FFmpeg script
  const scriptId = uuidv4();
  const scriptPath = path.join(TEMP_DIR, `${scriptId}.txt`);
  
  try {
    // Download all assets to local temp files (if they are URLs)
    console.log('[Renderer] Downloading assets...');
    const videoFiles = await Promise.all(
      videoAssets.map(async (asset) => {
        const fileId = uuidv4();
        const filePath = path.join(TEMP_DIR, `${fileId}${path.extname(asset.url)}`);
        
        if (asset.url.startsWith('http')) {
          // Download the file
          const response = await fetch(asset.url);
          const buffer = await response.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(buffer));
        } else {
          // Copy the file (if it's a local path)
          await fs.copyFile(asset.url, filePath);
        }
        
        return {
          ...asset,
          localPath: filePath,
        };
      })
    );
    
    const audioFiles = await Promise.all(
      audioAssets.map(async (asset) => {
        const fileId = uuidv4();
        const filePath = path.join(TEMP_DIR, `${fileId}${path.extname(asset.url)}`);
        
        if (asset.url.startsWith('http')) {
          // Download the file
          const response = await fetch(asset.url);
          const buffer = await response.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(buffer));
        } else {
          // Copy the file (if it's a local path)
          await fs.copyFile(asset.url, filePath);
        }
        
        return {
          ...asset,
          localPath: filePath,
        };
      })
    );
    
    // Get video duration
    const totalDuration = Math.max(
      ...videoAssets.map(asset => asset.start + asset.duration),
      ...audioAssets.map(asset => asset.start + asset.duration)
    );
    
    // Build FFmpeg command
    console.log('[Renderer] Generating FFmpeg command...');
    const command = buildFFmpegCommand(
      videoFiles,
      audioFiles,
      outputPath,
      settings,
      totalDuration
    );
    
    // Write the script to a file for debugging
    await fs.writeFile(scriptPath, JSON.stringify(command, null, 2));
    
    // Run FFmpeg
    console.log('[Renderer] Executing FFmpeg...');
    await executeFFmpeg(command, totalDuration, onProgress);
    
    // Generate public URL for the video
    const publicUrl = `/videos/${outputFilename}`;
    
    return {
      url: publicUrl,
      duration: totalDuration
    };
  } catch (error) {
    console.error('[Renderer] Error rendering video:', error);
    throw error;
  } finally {
    // Clean up temp files
    try {
      // Remove the script file
      await fs.unlink(scriptPath);
      
      // Remove temp video and audio files
      // This would be done in a production environment, but commented out for debugging
      /*
      for (const asset of [...videoFiles, ...audioFiles]) {
        await fs.unlink(asset.localPath);
      }
      */
    } catch (cleanupError) {
      console.error('[Renderer] Error cleaning up temp files:', cleanupError);
    }
  }
}

/**
 * Build FFmpeg command for a video with multiple video and audio tracks
 */
function buildFFmpegCommand(
  videoAssets: (VideoAsset & { localPath: string })[],
  audioAssets: (AudioAsset & { localPath: string })[],
  outputPath: string,
  settings: any,
  totalDuration: number
): string[] {
  // Start with base command
  const command: string[] = [
    '-y', // Overwrite output file if it exists
  ];
  
  // Add input files
  const inputs: string[] = [];
  const filterComplex: string[] = [];
  
  // Sort assets by start time
  videoAssets.sort((a, b) => a.start - b.start);
  audioAssets.sort((a, b) => a.start - b.start);
  
  // Add video inputs
  videoAssets.forEach((asset, index) => {
    inputs.push('-i', asset.localPath);
    
    // Add filter for positioning and duration
    let filterParams = `[${index}:v]`;
    
    // Apply effects if specified
    if (asset.effects?.length) {
      // Implement effect filters here
    }
    
    // Set trim and position
    filterParams += `trim=start=0:duration=${asset.duration},setpts=PTS-STARTPTS+${asset.start}/TB`;
    
    filterComplex.push(filterParams);
  });
  
  // Add audio inputs
  audioAssets.forEach((asset, index) => {
    const videoCount = videoAssets.length;
    inputs.push('-i', asset.localPath);
    
    // Add filter for audio positioning and volume
    let filterParams = `[${videoCount + index}:a]`;
    
    // Set volume
    filterParams += `volume=${asset.volume / 100}`;
    
    // Set trim and position
    filterParams += `,atrim=start=0:duration=${asset.duration},asetpts=PTS-STARTPTS+${asset.start}/TB`;
    
    filterComplex.push(filterParams);
  });
  
  // Add inputs to command
  command.push(...inputs);
  
  // Add filter complex
  if (filterComplex.length > 0) {
    command.push('-filter_complex', filterComplex.join(';'));
  }
  
  // Output settings
  command.push(
    '-c:v', settings.codec || 'libx264',
    '-preset', settings.preset || 'medium',
    '-crf', settings.crf?.toString() || '23',
    '-c:a', 'aac',
    '-b:a', settings.audioBitrate || '128k',
    '-movflags', '+faststart',
    outputPath
  );
  
  return command;
}

/**
 * Execute FFmpeg command and monitor progress
 */
async function executeFFmpeg(
  command: string[],
  totalDuration: number,
  onProgress?: (progress: number) => Promise<void>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(FFMPEG_PATH, command);
    
    let lastProgressUpdate = Date.now();
    
    // Parse FFmpeg output for progress
    ffmpeg.stderr.on('data', async (data) => {
      const output = data.toString();
      
      // Extract time from FFmpeg output
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseFloat(timeMatch[3]);
        
        const currentTime = hours * 3600 + minutes * 60 + seconds;
        const progress = Math.min(Math.round((currentTime / totalDuration) * 100), 100);
        
        // Update progress at most once per second
        const now = Date.now();
        if (now - lastProgressUpdate >= 1000) {
          lastProgressUpdate = now;
          
          if (onProgress) {
            try {
              await onProgress(progress);
            } catch (error) {
              console.error('Error updating progress:', error);
            }
          }
        }
      }
    });
    
    // Handle process completion
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        // Success
        if (onProgress) {
          onProgress(100).catch(error => {
            console.error('Error updating final progress:', error);
          });
        }
        resolve();
      } else {
        // Error
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
    
    // Handle process errors
    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}
