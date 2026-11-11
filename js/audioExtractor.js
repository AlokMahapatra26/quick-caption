/**
 * AutoCaption Studio • Web Audio Extractor & Resampler
 * Decodes audio tracks directly from video files in the browser,
 * downmixes stereo to mono, and resamples to 16kHz Float32Array for Whisper.
 */

export async function extract16kHzMonoAudio(videoFile, onProgress = () => {}) {
  onProgress(10, 'Reading video file...');
  const arrayBuffer = await videoFile.arrayBuffer();

  onProgress(30, 'Decoding audio track with Web Audio API...');
  // Standard AudioContext
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    throw new Error('Could not decode audio from video. Make sure the video contains an audio track.');
  } finally {
    audioCtx.close();
  }

  onProgress(60, 'Resampling to 16,000 Hz mono channel...');
  const targetSampleRate = 16000;
  const numChannels = 1;
  const targetLength = Math.round(audioBuffer.duration * targetSampleRate);

  // Use OfflineAudioContext to perform fast hardware-accelerated resampling
  const offlineCtx = new OfflineAudioContext(numChannels, targetLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const resampledBuffer = await offlineCtx.startRendering();
  const channelData = resampledBuffer.getChannelData(0);

  onProgress(90, 'Audio extracted successfully (16kHz Float32 ready).');
  return {
    audioData: channelData,
    duration: audioBuffer.duration,
    sampleRate: targetSampleRate
  };
}

