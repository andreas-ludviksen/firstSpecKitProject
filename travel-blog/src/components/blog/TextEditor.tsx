/**
 * Text Editor Component
 * Feature: 004-modular-blog-posts
 * 
 * Markdown text editor with preview
 */

'use client';

import { useState } from 'react';

export interface TextBlock {
  id: string;
  content: string;
  displayOrder: number;
}

interface TextEditorProps {
  textBlocks: TextBlock[];
  onAdd: (content: string) => Promise<void>;
  onUpdate: (textId: string, content: string) => Promise<void>;
  onDelete: (textId: string) => Promise<void>;
  onReorder: (textIds: string[]) => Promise<void>;
  editable?: boolean;
}

export default function TextEditor({
  textBlocks,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  editable = true,
}: TextEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const sortedBlocks = [...textBlocks].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleAdd = async () => {
    if (!content.trim()) return;

    try {
      await onAdd(content);
      setContent('');
      setIsAdding(false);
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to add text block:', error);
    }
  };

  const handleEdit = (block: TextBlock) => {
    setEditingId(block.id);
    setContent(block.content);
    setShowPreview(false);
  };

  const handleSave = async (textId: string) => {
    if (!content.trim()) return;

    try {
      await onUpdate(textId, content);
      setEditingId(null);
      setContent('');
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to update text block:', error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setContent('');
    setShowPreview(false);
  };

  const handleDelete = async (textId: string) => {
    if (!confirm('Are you sure you want to delete this text block?')) return;
    
    try {
      await onDelete(textId);
    } catch (error) {
      console.error('Failed to delete text block:', error);
    }
  };

  const handleDragStart = (textId: string) => {
    setDraggedId(textId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sortedBlocks.findIndex(b => b.id === draggedId);
    const targetIndex = sortedBlocks.findIndex(b => b.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...sortedBlocks];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    onReorder(reordered.map(b => b.id));
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Simple markdown to HTML conversion (basic support)
  const renderMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br/>');
  };

  return (
    <div className="space-y-4">
      {/* Existing Text Blocks */}
      {sortedBlocks.map((block) => (
        <div
          key={block.id}
          draggable={editable && editingId !== block.id}
          onDragStart={() => handleDragStart(block.id)}
          onDragOver={(e) => handleDragOver(e, block.id)}
          onDragEnd={handleDragEnd}
          className={`
            bg-white rounded-lg border p-4 transition-all
            ${editable && editingId !== block.id ? 'cursor-move hover:shadow-md' : ''}
            ${draggedId === block.id ? 'opacity-50' : ''}
          `}
        >
          {editingId === block.id ? (
            <div className="space-y-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1 text-sm rounded ${!showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1 text-sm rounded ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Preview
                </button>
              </div>

              {showPreview ? (
                <div
                  className="prose max-w-none p-4 bg-gray-50 rounded border"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] font-mono text-sm"
                  placeholder="Write your text here... (Markdown supported: **bold**, *italic*, [link](url), # headers)"
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(block.id)}
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
              <div
                className="prose max-w-none mb-3"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }}
              />
              {editable && (
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleEdit(block)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(block.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Add New Text Block */}
      {editable && (
        <>
          {isAdding ? (
            <div className="bg-white rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`px-3 py-1 text-sm rounded ${!showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`px-3 py-1 text-sm rounded ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    Preview
                  </button>
                </div>

                {showPreview ? (
                  <div
                    className="prose max-w-none p-4 bg-gray-50 rounded border"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] font-mono text-sm"
                    placeholder="Write your text here... (Markdown supported: **bold**, *italic*, [link](url), # headers)"
                    autoFocus
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Text Block
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add Text Block
            </button>
          )}
        </>
      )}

      {!editable && sortedBlocks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-600">No text content</p>
        </div>
      )}
    </div>
  );
}
