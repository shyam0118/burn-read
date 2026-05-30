'use client';

import { useCallback, useState } from 'react';
import { FolderOpen } from 'lucide-react';

interface FileUploadProps {
  onFile: (content: string, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFile, disabled }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.txt')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onFile(text, file.name);
        }
      };
      reader.readAsText(file);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all
        ${dragOver ? 'border-accent bg-accent/5 scale-[1.02]' : 'border-border hover:border-muted'}
        ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload-input')?.click()}
    >
      <input
        id="file-upload-input"
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-accent" />
        </div>
        <div>
          <p className="text-base font-semibold">
            Drop your WhatsApp chat export here
          </p>
          <p className="text-sm text-muted mt-1">
            .txt file only — click or drag and drop
          </p>
        </div>
        <div className="mt-2 text-xs text-muted bg-card px-3 py-1.5 rounded-full">
          How to export:{' '}
          <span className="text-foreground">
            WhatsApp → Chat → ⋮ → More → Export Chat → Without Media
          </span>
        </div>
      </div>
    </div>
  );
}
