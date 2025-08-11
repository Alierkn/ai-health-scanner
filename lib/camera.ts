export async function initializeCamera(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Back camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    return stream;
  } catch (error) {
    console.error('Failed to initialize camera:', error);
    throw new Error('Camera access denied or not available');
  }
}

export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Scale down to reasonable size for API
  const maxWidth = 720;
  const maxHeight = 720;
  
  let { width, height } = video.getBoundingClientRect();
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(video, 0, 0, width, height);
  
  // Convert to JPEG with 0.8 quality
  return canvas.toDataURL('image/jpeg', 0.8);
}

export function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop());
}
