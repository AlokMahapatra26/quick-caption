/**
 * Generates an interactive synthetic 9:16 vertical demo video via Canvas + MediaRecorder.
 */
export function generateSyntheticDemoVideo(): Promise<File> {
  return new Promise((resolve, reject) => {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 720;
    demoCanvas.height = 1280;
    const dctx = demoCanvas.getContext('2d');

    if (!dctx) {
      reject(new Error('Could not initialize 2D canvas context for demo video.'));
      return;
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';
    const stream = demoCanvas.captureStream(30);
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => reject(new Error('Failed to generate demo clip.'));
    recorder.onstop = () => {
      const type = mimeType || 'video/webm';
      const blob = new Blob(chunks, { type });
      resolve(new File([blob], 'viral-demo-clip.webm', { type }));
    };

    recorder.start();
    let frame = 0;
    const totalFrames = 30 * 10; // 10 seconds at 30fps

    const animInterval = setInterval(() => {
      frame++;

      const grad = dctx.createLinearGradient(0, 0, 720, 1280);
      const shift = Math.sin(frame * 0.05);
      grad.addColorStop(0, shift > 0 ? '#111827' : '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#09090b');
      dctx.fillStyle = grad;
      dctx.fillRect(0, 0, 720, 1280);

      dctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
      dctx.beginPath();
      dctx.arc(
        360 + Math.sin(frame * 0.04) * 120,
        500 + Math.cos(frame * 0.03) * 150,
        180,
        0,
        Math.PI * 2
      );
      dctx.fill();

      dctx.fillStyle = 'rgba(255, 230, 0, 0.1)';
      dctx.beginPath();
      dctx.arc(
        360 - Math.sin(frame * 0.04) * 100,
        700 - Math.cos(frame * 0.03) * 120,
        220,
        0,
        Math.PI * 2
      );
      dctx.fill();

      dctx.fillStyle = 'rgba(255,255,255,0.4)';
      dctx.font = '600 24px sans-serif';
      dctx.textAlign = 'center';
      dctx.fillText('DEMO VERTICAL VIDEO CLIP (9:16)', 360, 240);

      if (frame >= totalFrames) {
        clearInterval(animInterval);
        recorder.stop();
      }
    }, 1000 / 30);
  });
}
