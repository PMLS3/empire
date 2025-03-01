import fs from "fs/promises"
import path from "path"
import { MultiFileLoader } from "langchain/document_loaders/fs/multi_file"
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv"
import ffmpeg from "fluent-ffmpeg"
import { Stats } from 'fs'

export async function readFileContent(filepath: string): Promise<string> {
  try {
    return await fs.readFile(filepath, "utf-8")
  } catch (error) {
    return `❌ Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`
  }
}

export async function writeFileContent(
  filepath: string,
  content: string
): Promise<boolean> {
  try {
    await fs.writeFile(filepath, content, "utf-8")
    return true
  } catch {
    return false
  }
}

export async function isTextFile(filepath: string): Promise<boolean> {
  try {
    const buffer = await fs.readFile(filepath)
    const sampleSize = Math.min(buffer.length, 8192)
    const sample = buffer.slice(0, sampleSize)
    const textChars = sample.toString().replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    return textChars.length / sampleSize > 0.7
  } catch {
    return false
  }
}

export async function createFolder(folderPath: string): Promise<boolean> {
  try {
    await fs.mkdir(folderPath, { recursive: true })
    return true
  } catch {
    return false
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath)
    return files
  } catch {
    return []
  }
}

export async function deleteFile(filepath: string): Promise<boolean> {
  try {
    await fs.unlink(filepath)
    return true
  } catch {
    return false
  }
}

export async function moveFile(
  oldPath: string,
  newPath: string
): Promise<boolean> {
  try {
    await fs.rename(oldPath, newPath)
    return true
  } catch {
    return false
  }
}

export async function getFileStats(filepath: string): Promise<Stats | null> {
  try {
    return await fs.stat(filepath)
  } catch {
    return null
  }
}

export function getFileExtension(filepath: string): string {
  return path.extname(filepath).slice(1)
}

export function chunkFile(
  filepath: string,
  chunkSize: number
): Promise<string[]> {
  return fs.readFile(filepath, "utf-8").then((content) => {
    const chunks = []
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize))
    }
    return chunks
  })
}

export function chunkText(text: string, chunkSize: number): string[] {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

export const videoToAudio = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const audioUrl = videoUrl.replace(".mp4", ".mp3")
    ffmpeg(videoUrl)
      .audioCodec('libmp3lame')
      .output(audioUrl)
      .on("end", () => resolve(audioUrl))
      .on("error", (err: any) => reject(err))
      .run()
  })
}

export function audioToText(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .toFormat('wav')
      .output(filepath)
      .on('end', () => resolve(filepath))
      .on('error', (err: any) => reject(err))
      .run()
  })
}

export function textToSpeech(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .audioCodec('libmp3lame')
      .output(filepath)
      .on('end', () => resolve(filepath))
      .on('error', (err: any) => reject(err))
      .run()
  })
}

export function videoToText(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .output(filepath)
      .on('end', () => resolve(filepath))
      .on('error', (err: any) => reject(err))
      .run()
  })
}

export function textToVideo(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .output(filepath)
      .on('end', () => resolve(filepath))
      .on('error', (err: any) => reject(err))
      .run()
  })
}

export function audioToVideo(filepath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(filepath)
      .output(filepath)
      .on('end', () => resolve(filepath))
      .on('error', (err: any) => reject(err))
      .run()
  })
}

export const concatFiles = async (filepaths: string[]): Promise<any> => {
  const loader = new MultiFileLoader([...filepaths], {
    ".json": (path: any) => new JSONLoader(path, "/texts"),
    ".jsonl": (path: any) => new JSONLinesLoader(path, "/html"),
    ".txt": (path: any) => new TextLoader(path),
    ".csv": (path: any) => new CSVLoader(path, "text"),
  })
  const docs = await loader.load()
  console.log({ docs })
  return docs
}
