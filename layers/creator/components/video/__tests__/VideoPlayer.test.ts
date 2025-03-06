import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import VideoPlayer from '../VideoPlayer.vue';

// Mock the video element functionality
HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.pause = vi.fn().mockResolvedValue(undefined);
HTMLMediaElement.prototype.load = vi.fn();

// Mock useVideoDelivery composable
vi.mock('../../../composables/useVideoDelivery', () => ({
  useVideoDelivery: () => ({
    initializePlayer: vi.fn(),
    loadVideo: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    togglePlay: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    formatTime: (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`,
    isPlaying: ref(false),
    isPaused: ref(true),
    isMuted: ref(false),
    isBuffering: ref(false),
    isReady: ref(true),
    currentTime: ref(30),
    duration: ref(120),
    progress: ref(25),
    bufferedPercentage: ref(50),
    volume: ref(0.5),
    error: ref(null),
  }),
}));

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(VideoPlayer);
    
    const videoElement = screen.getByRole('video');
    expect(videoElement).toBeInTheDocument();
  });

  it('displays play button when video is paused', () => {
    render(VideoPlayer);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });

  it('displays loading indicator when buffering', async () => {
    // Mock isBuffering state
    vi.mocked(useVideoDelivery).mockReturnValueOnce({
      ...useVideoDelivery(),
      isBuffering: ref(true),
    });
    
    render(VideoPlayer);
    
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('displays error message when error occurs', async () => {
    const errorMessage = 'Video failed to load';
    
    // Mock error state
    vi.mocked(useVideoDelivery).mockReturnValueOnce({
      ...useVideoDelivery(),
      error: ref(errorMessage),
    });
    
    render(VideoPlayer);
    
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
  });

  it('toggles mute when mute button is clicked', async () => {
    const toggleMuteMock = vi.fn();
    
    // Mock toggleMute function
    vi.mocked(useVideoDelivery).mockReturnValueOnce({
      ...useVideoDelivery(),
      toggleMute: toggleMuteMock,
    });
    
    render(VideoPlayer);
    
    const muteButton = screen.getByRole('button', { name: /mute/i });
    await fireEvent.click(muteButton);
    
    expect(toggleMuteMock).toHaveBeenCalledTimes(1);
  });
});
