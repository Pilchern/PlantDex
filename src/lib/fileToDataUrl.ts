// Normalizes any browser-renderable image (including iPhone HEIC photos, which
// Safari can display but identification APIs generally can't decode) into a
// real, size-capped JPEG data URL by drawing it through a canvas and re-encoding.
const MAX_DIMENSION = 1600;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);

      if (!ctx || canvas.width === 0 || canvas.height === 0) {
        fallbackToRawDataUrl(file, resolve, reject);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // The browser couldn't decode this image at all (most commonly a HEIC/HEIF
      // photo opened outside Safari/macOS, which lack a native HEIC decoder).
      // Sending the raw undecoded bytes here would just fail identically at
      // Plant.id, so fail fast with an actionable message instead of masking it.
      reject(
        new Error(
          "This photo couldn't be read by your browser. HEIC/HEIF photos from an iPhone " +
            'often need Safari, or convert the file to JPG/PNG first and re-upload.'
        )
      );
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
