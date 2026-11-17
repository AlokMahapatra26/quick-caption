import type { AudioExtractionResult } from '../types/caption';

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * Decodes audio track from a video file in the browser, downmixes to mono,
 * and resamples to 16kHz Float32Array for Whisper.
 */
export async function extract16kHzMonoAudio(
  videoFile: File,
  onProgress: (percent: number, message: string) => void = () => {}
): Promise<AudioExtractionResult> {
  onProgress(10, 'Reading video file...');
  const arrayBuffer = await videoFile.arrayBuffer();

  onProgress(30, 'Decoding audio track with Web Audio API...');
  const AudioCtx =
    window.AudioContext || (window as WebkitWindow).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioCtx();
  let audioBuffer: AudioBuffer;

  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    throw new Error(
      'Could not decode audio from video. Make sure the video contains an audio track.'
    );
  } finally {
    await audioCtx.close();
  }

  onProgress(60, 'Resampling to 16,000 Hz mono channel...');
  const targetSampleRate = 16000;
  const numChannels = 1;
  const targetLength = Math.max(
    1,
    Math.round(audioBuffer.duration * targetSampleRate)
  );

  const offlineCtx = new OfflineAudioContext(
    numChannels,
    targetLength,
    targetSampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const resampledBuffer = await offlineCtx.startRendering();
  // Copy into a dedicated Float32Array so its backing buffer can be safely transferred to the worker
  const channelData = new Float32Array(resampledBuffer.getChannelData(0));

  onProgress(90, 'Audio extracted successfully (16kHz Float32 ready).');
  return {
    audioData: channelData,
    duration: audioBuffer.duration,
    sampleRate: targetSampleRate,
  };
}
