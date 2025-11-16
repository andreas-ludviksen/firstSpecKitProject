/**
 * Photo List Component
 * Feature: 004-modular-blog-posts
 * 
 * Displays and manages photos with drag-drop reordering
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface Photo {
  id: string;
  url: string;
  caption: string | null;
  altText: string;
  displayOrder: number;
  width?: number | null;
  height?: number | null;
}

interface PhotoListProps {
  photos: Photo[];
  onUpdate: (photoId: string, updates: { caption?: string; altText?: string }) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  onReorder: (photoIds: string[]) => Promise<void>;
  editable?: boolean;
}

export default function PhotoList({
  photos,
  onUpdate,
  onDelete,
  onReorder,
  editable = true,
}: PhotoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ caption: string; altText: string }>({
    caption: '',
    altText: '',
  });

  const sortedPhotos = [...photos].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setFormData({
      caption: photo.caption || '',
      altText: photo.altText,
    });
  };

  const handleSave = async (photoId: string) => {
    try {
      await onUpdate(photoId, formData);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ caption: '', altText: '' });
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await onDelete(photoId);
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleDragStart = (photoId: string) => {
    setDraggedId(photoId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sortedPhotos.findIndex(p => p.id === draggedId);
    const targetIndex = sortedPhotos.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...sortedPhotos];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorder(reordered.map(p => p.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  if (sortedPhotos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No photos added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedPhotos.map((photo) => (
        <div
          key={photo.id}
          draggable={editable}
          onDragStart={() => handleDragStart(photo.id)}
          onDragOver={(e) => handleDragOver(e, photo.id)}
          onDragEnd={handleDragEnd}
          className={`
            bg-white rounded-lg border p-4 transition-all
            ${editable ? 'cursor-move hover:shadow-md' : ''}
            ${draggedId === photo.id ? 'opacity-50' : ''}
          `}
        >
          <div className="flex gap-4">
            {/* Photo Thumbnail */}
            <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={photo.url}
                alt={photo.altText}
                fill
                className="object-cover"
              />
            </div>

            {/* Photo Details */}
            <div className="flex-1 min-w-0">
              {editingId === photo.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={formData.caption}
                      onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a caption..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text (required for accessibility)
                    </label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the image..."
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(photo.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    {photo.caption && (
                      <p className="text-gray-900 mb-1">{photo.caption}</p>
                    )}
                    <p className="text-sm text-gray-600">Alt: {photo.altText}</p>
                    {photo.width && photo.height && (
                      <p className="text-xs text-gray-500 mt-1">
                        {photo.width} × {photo.height}
                      </p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(photo)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
