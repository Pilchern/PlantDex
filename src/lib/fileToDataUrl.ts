// Normalizes any browser-renderable image (including iPhone HEIC photos, which
// Safari can display but identification APIs generally can't decode) into a
// real JPEG data URL by drawing it through a canvas and re-encoding.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);

      if (!ctx || canvas.width === 0 || canvas.height === 0) {
        fallbackToRawDataUrl(file, resolve, reject);
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      fallbackToRawDataUrl(file, resolve, reject);
    };

    img.src = objectUrl;
  });
}

function fallbackToRawDataUrl(
  file: File,
  resolve: (value: string) => void,
  reject: (reason?: unknown) => void
) {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
}
