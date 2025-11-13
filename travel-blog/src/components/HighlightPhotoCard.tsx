'use client';

import Image from 'next/image';
import { HighlightPhoto } from '@/types';

interface HighlightPhotoCardProps {
  photo: HighlightPhoto;
}

export default function HighlightPhotoCard({ photo }: HighlightPhotoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={photo.imageUrl}
          alt={photo.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl font-bold mb-1">{photo.title}</h3>
          <p className="text-sm text-gray-200">{photo.location}</p>
          {photo.story && (
            <p className="text-sm text-gray-300 mt-2 line-clamp-2">{photo.story}</p>
          )}
        </div>
      </div>
    </div>
  );
}
