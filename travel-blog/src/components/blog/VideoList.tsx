/**
 * Video List Component
 * Feature: 004-modular-blog-posts
 * 
 * Displays and manages videos with drag-drop reordering
 */

'use client';

import { useState } from 'react';

export interface Video {
  id: string;
  url: string;
  caption: string | null;
  displayOrder: number;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
}

interface VideoListProps {
  videos: Video[];
  onUpdate: (videoId: string, updates: { caption?: string; thumbnailUrl?: string }) => Promise<void>;
  onDelete: (videoId: string) => Promise<void>;
  onReorder: (videoIds: string[]) => Promise<void>;
  editable?: boolean;
}

export default function VideoList({
  videos,
  onUpdate,
  onDelete,
  onReorder,
  editable = true,
}: VideoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ caption: string; thumbnailUrl: string }>({
    caption: '',
    thumbnailUrl: '',
  });

  const sortedVideos = [...videos].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      caption: video.caption || '',
      thumbnailUrl: video.thumbnailUrl || '',
    });
  };

  const handleSave = async (videoId: string) => {
    try {
      await onUpdate(videoId, formData);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update video:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ caption: '', thumbnailUrl: '' });
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await onDelete(videoId);
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleDragStart = (videoId: string) => {
    setDraggedId(videoId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sortedVideos.findIndex(v => v.id === draggedId);
    const targetIndex = sortedVideos.findIndex(v => v.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...sortedVideos];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorder(reordered.map(v => v.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sortedVideos.length === 0) {
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No videos added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedVideos.map((video) => (
        <div
          key={video.id}
          draggable={editable}
          onDragStart={() => handleDragStart(video.id)}
          onDragOver={(e) => handleDragOver(e, video.id)}
          onDragEnd={handleDragEnd}
          className={`
            bg-white rounded-lg border p-4 transition-all
            ${editable ? 'cursor-move hover:shadow-md' : ''}
            ${draggedId === video.id ? 'opacity-50' : ''}
          `}
        >
          <div className="flex gap-4">
            {/* Video Thumbnail */}
            <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.caption || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
              {video.durationSeconds && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.durationSeconds)}
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="flex-1 min-w-0">
              {editingId === video.id ? (
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
                      Thumbnail URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(video.id)}
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
                    {video.caption && (
                      <p className="text-gray-900 mb-1">{video.caption}</p>
                    )}
                    <p className="text-sm text-gray-600 truncate">{video.url}</p>
                    {video.durationSeconds && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {formatDuration(video.durationSeconds)}
                      </p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(video)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
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
