'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, GripVertical, Star, Upload, ImageIcon, Loader2 } from 'lucide-react';
import type { ProductImage } from '@/lib/db/schema';

interface Props {
  productId: number;
  initialImages: ProductImage[];
}

export default function ImageManager({ productId, initialImages }: Props) {
  const router = useRouter();
  const [images, setImages] = useState<ProductImage[]>([...initialImages].sort((a, b) => a.sortOrder - b.sortOrder));
  const [draggingOver, setDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append('imagen', file);
        const res = await fetch(`/api/productos/${productId}/imagen`, { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
          setImages((prev) => [...prev, data]);
        } else {
          setUploadError(data.error ?? 'Error al subir imagen.');
        }
      }
      router.refresh();
    } catch {
      setUploadError('Error de conexión. Intentá de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  // Drop zone handlers
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    // Solo mostrar zona si viene de archivos externos (no de reorder interno)
    if (e.dataTransfer.types.includes('Files')) setDraggingOver(true);
  }
  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDraggingOver(false);
  }
  async function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  }

  // Reorder drag handlers
  function onItemDragStart(e: React.DragEvent, index: number) {
    setDragItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Evitar que active el drop zone de archivos
    e.dataTransfer.clearData();
    e.dataTransfer.setData('text/plain', String(index));
  }
  function onItemDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragItemIndex === null || dragItemIndex === index) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragItemIndex, 1);
    reordered.splice(index, 0, moved);
    setDragItemIndex(index);
    setImages(reordered);
  }
  async function onItemDragEnd() {
    setDragItemIndex(null);
    // Persistir nuevo orden
    const payload = images.map((img, i) => ({ id: img.id, sortOrder: i }));
    await fetch(`/api/productos/${productId}/imagen`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    router.refresh();
  }

  async function deleteImage(img: ProductImage) {
    if (!confirm('¿Eliminar esta imagen?')) return;
    const res = await fetch(`/api/productos/${productId}/imagen/${img.id}`, { method: 'DELETE' });
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      router.refresh();
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon size={16} />
          Imágenes del producto
          {images.length > 0 && (
            <span className="text-xs font-normal text-gray-400">({images.length} — arrastrá para reordenar)</span>
          )}
        </p>
        {images.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Star size={12} fill="currentColor" />
            La 1ª imagen es la portada
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 gap-3 cursor-pointer transition-colors ${
          draggingOver
            ? 'border-[var(--color-primary)] bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        {uploading ? (
          <Loader2 size={28} className="text-[var(--color-primary)] animate-spin" />
        ) : (
          <Upload size={28} className="text-gray-400" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {uploading ? 'Subiendo...' : 'Arrastrá imágenes aquí o hacé clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG o WebP · máx. 5 MB por imagen · podés subir varias</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}

      {/* Grilla de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => onItemDragStart(e, index)}
              onDragOver={(e) => onItemDragOver(e, index)}
              onDragEnd={onItemDragEnd}
              className={`relative group rounded-xl border-2 overflow-hidden bg-gray-50 aspect-square transition-all cursor-grab active:cursor-grabbing ${
                dragItemIndex === index
                  ? 'border-[var(--color-primary)] opacity-60 scale-95'
                  : index === 0
                  ? 'border-amber-400'
                  : 'border-gray-200'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-contain p-2"
                sizes="120px"
              />

              {/* Badge portada */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  Portada
                </span>
              )}

              {/* Icono arrastre */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={14} className="text-gray-500" />
              </div>

              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => deleteImage(img)}
                className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity hover:bg-red-600"
                aria-label="Eliminar imagen"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
