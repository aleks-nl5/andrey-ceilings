import React, { useRef, useState } from 'react';
import { Camera, Plus, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';
import { MeasurementPhoto } from '../types/database';

interface PhotoUploaderProps {
  photos: MeasurementPhoto[];
  onChange: (photos: MeasurementPhoto[]) => void;
  title?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  title = 'Фотографии объекта и замера',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePreview, setActivePreview] = useState<MeasurementPhoto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Resize and compress image on canvas to maintain performance and prevent localStorage quota issues
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 900;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: MeasurementPhoto[] = [...photos];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const dataUrl = await compressImage(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }

    onChange(newPhotos);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, caption } : p));
    onChange(updated);
  };

  const handleDeletePhoto = (id: string) => {
    const filtered = photos.filter((p) => p.id !== id);
    onChange(filtered);
    if (activePreview?.id === id) {
      setActivePreview(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{title}</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({photos.length})</span>
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition active:scale-95 shadow-sm"
        >
          {isProcessing ? (
            <span className="animate-spin text-sm">⏳</span>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Додати фото</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-cyan-500 rounded-xl p-5 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/70 group shadow-xs"
        >
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">Натисніть, щоб зробити фото або обрати з галереї</p>
          <p className="text-xs text-slate-500 mt-1">Труби, проводка, стіни, ніші, отвори</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
            >
              <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                <img
                  src={photo.dataUrl}
                  alt={photo.caption || 'Фото об’єкта'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePreview(photo)}
                    className="p-1.5 rounded-lg bg-slate-800/90 text-white hover:bg-cyan-600 transition"
                    title="Переглянути"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-1.5 rounded-lg bg-red-900/90 text-white hover:bg-red-600 transition"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Caption input */}
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={photo.caption || ''}
                  placeholder="Примітка до фото..."
                  onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                  className="w-full text-[11px] bg-transparent text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
              <img
                src={activePreview.dataUrl}
                alt={activePreview.caption || 'Предпросмотр фото'}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium">{activePreview.caption || 'Без названия'}</span>
                <span className="text-slate-500">
                  {new Date(activePreview.timestamp).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
