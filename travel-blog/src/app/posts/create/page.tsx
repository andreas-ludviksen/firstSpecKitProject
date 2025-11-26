/**
 * Create Post Page
 * Feature: 004-modular-blog-posts
 * 
 * Post editor with media uploads and content management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaUploader from '@/components/blog/MediaUploader';
import PhotoList, { type Photo } from '@/components/blog/PhotoList';
import VideoList, { type Video } from '@/components/blog/VideoList';
import TextEditor, { type TextBlock } from '@/components/blog/TextEditor';
import UploadProgress from '@/components/blog/UploadProgress';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to get API URL based on environment
  const getPostsApiUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')) {
      return 'https://travel-blog-posts.andreas-e-ludviksen.workers.dev';
    }
    return process.env.NEXT_PUBLIC_POSTS_API_URL || 'http://localhost:8788';
  };
  
  // Helper function to get media API URL based on environment
  const getMediaApiUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')) {
      return 'https://travel-blog-media.andreas-e-ludviksen.workers.dev';
    }
    return process.env.NEXT_PUBLIC_MEDIA_API_URL || 'http://localhost:8789';
  };
  
  // Helper function to get session token from localStorage or cookie
  const getSessionToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first (for production cross-domain)
    const storedToken = localStorage.getItem('session_token');
    if (storedToken) return storedToken;
    
    // Fallback to cookie (for local development)
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session='));
    return sessionCookie ? sessionCookie.split('=')[1] : null;
  };
  
  // Post metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [postId, setPostId] = useState<string | null>(null);
  
  // Content
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  
  // Upload tracking
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'text'>('photos');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // For now, use hardcoded templates - will fetch from API later
      setTemplates([
        { id: 'template-01', name: 'Classic Grid', description: '3-column photo grid with text sections' },
        { id: 'template-02', name: 'Story Layout', description: 'Single column storytelling layout' },
        { id: 'template-03', name: 'Photo Grid Showcase', description: 'Large photo grid, minimal text' },
        { id: 'template-04', name: 'Video-First Layout', description: 'Hero video with photo gallery' },
        { id: 'template-05', name: 'Masonry Layout', description: 'Pinterest-style masonry grid' },
      ]);
      setSelectedTemplate('template-01'); // Default template
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to create posts');
      }
      
      const response = await fetch(`${getPostsApiUrl()}/api/posts/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create post');
      }

      const data = await response.json();
      setPostId(data.postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!postId) {
      setError('Please create the post first');
      return;
    }

    for (const file of files) {
      const uploadId = Math.random().toString(36);
      setUploads(prev => [...prev, {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading',
      }]);

      try {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Please log in to upload photos');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('postId', postId);
        formData.append('altText', file.name.replace(/\.[^/.]+$/, '')); // Remove extension
        formData.append('displayOrder', photos.length.toString());

        const response = await fetch(`${getMediaApiUrl()}/api/media/upload-photo`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Upload failed');
        }

        const data = await response.json();
        
        setPhotos(prev => [...prev, {
          id: data.photoId,
          url: data.url,
          caption: null,
          altText: file.name.replace(/\.[^/.]+$/, ''),
          displayOrder: photos.length,
          width: data.width,
          height: data.height,
        }]);

        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u
        ));
      } catch (err) {
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' } 
            : u
        ));
      }
    }
  };

  const handleVideoUpload = async (files: File[]) => {
    if (!postId) {
      setError('Please create the post first');
      return;
    }

    for (const file of files) {
      const uploadId = Math.random().toString(36);
      setUploads(prev => [...prev, {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading',
      }]);

      try {
        const token = getSessionToken();
        if (!token) {
          throw new Error('Please log in to upload videos');
        }
        
        const formData = new FormData();
        formData.append('video', file);
        formData.append('postId', postId);
        formData.append('displayOrder', videos.length.toString());

        const response = await fetch(`${getMediaApiUrl()}/api/media/upload-video-stream`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Upload failed');
        }

        const data = await response.json();
        
        setVideos(prev => [...prev, {
          id: data.video.id,
          url: data.video.url,
          caption: null,
          displayOrder: videos.length,
        }]);

        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u
        ));
      } catch (err) {
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' } 
            : u
        ));
      }
    }
  };

  const handlePhotoUpdate = async (photoId: string, updates: { caption?: string; altText?: string }) => {
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to update photos');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/photos/${photoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update photo');

      await response.json();
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updates } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update photo');
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to delete photos');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete photo');

      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const handlePhotoReorder = async (photoIds: string[]) => {
    setPhotos(prev => {
      const newOrder = photoIds.map((id, index) => {
        const photo = prev.find(p => p.id === id);
        return photo ? { ...photo, displayOrder: index } : null;
      }).filter((p): p is Photo => p !== null);
      return newOrder;
    });

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to reorder content');
      }
      
      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/reorder`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: 'photo', contentIds: photoIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(errorData.message || `Failed to reorder photos: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to reorder photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder photos');
    }
  };

  const handleVideoUpdate = async (videoId: string, updates: { caption?: string; thumbnailUrl?: string }) => {
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to update videos');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/videos/${videoId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update video');

      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, ...updates } : v));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
    }
  };

  const handleVideoDelete = async (videoId: string) => {
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to delete videos');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete video');

      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  const handleVideoReorder = async (videoIds: string[]) => {
    setVideos(prev => {
      const newOrder = videoIds.map((id, index) => {
        const video = prev.find(v => v.id === id);
        return video ? { ...video, displayOrder: index } : null;
      }).filter((v): v is Video => v !== null);
      return newOrder;
    });

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to reorder content');
      }
      
      await fetch(`${getPostsApiUrl()}/api/posts/${postId}/reorder`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: 'video', contentIds: videoIds }),
      });
    } catch (err) {
      console.error('Failed to reorder videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder videos');
    }
  };

  const handleTextAdd = async (content: string) => {
    if (!postId) return;

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to add text blocks');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/text`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content,
          displayOrder: textBlocks.length 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add text block');
      }

      const data = await response.json();
      
      setTextBlocks(prev => [...prev, {
        id: data.textId,
        content: data.content,
        displayOrder: data.displayOrder,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add text block');
    }
  };

  const handleTextUpdate = async (textId: string, content: string) => {
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to update text blocks');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/text/${textId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to update text');

      setTextBlocks(prev => prev.map(t => t.id === textId ? { ...t, content } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update text');
    }
  };

  const handleTextDelete = async (textId: string) => {
    try {
      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}/text/${textId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete text');

      setTextBlocks(prev => prev.filter(t => t.id !== textId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete text');
    }
  };

  const handleTextReorder = async (textIds: string[]) => {
    setTextBlocks(prev => {
      const newOrder = textIds.map((id, index) => {
        const block = prev.find(t => t.id === id);
        return block ? { ...block, displayOrder: index } : null;
      }).filter((t): t is TextBlock => t !== null);
      return newOrder;
    });

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to reorder content');
      }
      
      await fetch(`${getPostsApiUrl()}/api/posts/${postId}/reorder`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ contentType: 'text', contentIds: textIds }),
      });
    } catch (err) {
      console.error('Failed to reorder text blocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder text blocks');
    }
  };

  const handlePublish = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Please log in to publish posts');
      }

      const response = await fetch(`${getPostsApiUrl()}/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to publish post');

      // Redirect to home page (post detail page not available in static export)
      alert('Post published successfully!');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-2">Share your travel story with photos, videos, and text</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Post Metadata */}
        {!postId ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Post Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  rows={3}
                  placeholder="Brief description of your post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {templates.map((template) => (
                    <label
                      key={template.id}
                      className={`
                        flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplate === template.id}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={loading || !title.trim() || !selectedTemplate}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{title}</h2>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  {loading ? 'Publishing...' : 'Publish'}
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('photos')}
                    className={`pb-3 px-1 border-b-2 font-medium ${
                      activeTab === 'photos'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Photos ({photos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`pb-3 px-1 border-b-2 font-medium ${
                      activeTab === 'videos'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Videos ({videos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`pb-3 px-1 border-b-2 font-medium ${
                      activeTab === 'text'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Text ({textBlocks.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  <MediaUploader
                    type="photo"
                    onUpload={handlePhotoUpload}
                    accept="image/*"
                    maxFiles={20}
                    maxSizeMB={10}
                  />
                  <PhotoList
                    photos={photos}
                    onUpdate={handlePhotoUpdate}
                    onDelete={handlePhotoDelete}
                    onReorder={handlePhotoReorder}
                  />
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <MediaUploader
                    type="video"
                    onUpload={handleVideoUpload}
                    accept="video/*"
                    maxFiles={10}
                    maxSizeMB={500}
                  />
                  <VideoList
                    videos={videos}
                    onUpdate={handleVideoUpdate}
                    onDelete={handleVideoDelete}
                    onReorder={handleVideoReorder}
                  />
                </div>
              )}

              {activeTab === 'text' && (
                <TextEditor
                  textBlocks={textBlocks}
                  onAdd={handleTextAdd}
                  onUpdate={handleTextUpdate}
                  onDelete={handleTextDelete}
                  onReorder={handleTextReorder}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Progress */}
      <UploadProgress 
        uploads={uploads}
        onDismiss={(id) => setUploads(prev => prev.filter(u => u.id !== id))}
      />
    </div>
  );
}
