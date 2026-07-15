import { useRef, useState } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import clsx from 'clsx';

interface PhotoUploaderProps {
  onFile: (file: File) => void;
  previewUrl?: string | null;
  busy?: boolean;
  label?: string;
  compact?: boolean;
}

export default function PhotoUploader({
  onFile,
  previewUrl,
  busy,
  label = 'Upload a photo',
  compact = false,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
        dragOver ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/15 bg-white/5 hover:border-white/30',
        compact ? 'aspect-square w-full' : 'aspect-[4/3] w-full'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
          {busy ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
          <p className="text-sm font-medium">{busy ? 'Identifying species...' : label}</p>
          {!busy && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Upload className="h-3 w-3" /> tap to take a photo or choose one
            </p>
          )}
        </div>
      )}

      {busy && previewUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Identifying species...</p>
        </div>
      )}
    </div>
  );
}
