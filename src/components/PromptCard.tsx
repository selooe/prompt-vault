'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import { getYouTubeEmbedUrl } from '@/lib/videoUtils';

interface PromptCardProps {
  id: string;
  title: string;
  subject: string;
  style: string;
  fullPrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  onDeleteSuccess: (id: string) => void; 
}

export default function PromptCard({ 
  id, 
  title, 
  subject, 
  style, 
  fullPrompt, 
  imageUrl, 
  videoUrl,
  onDeleteSuccess 
}: PromptCardProps) {

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = confirm(`Are you sure you want to delete "${title}"?`);
    
    if (confirmDelete) {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting prompt: ' + error.message);
      } else {
        onDeleteSuccess(id);
      }
    }
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative break-inside-avoid mb-6">
      
      {/* MANAGEMENT ACTIONS - Top Right */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {/* NEW EDIT BUTTON */}
        <Link 
          href={`/edit/${id}`} 
          className="bg-white/80 hover:bg-blue-500 hover:text-white p-2 rounded-full shadow-sm transition-colors text-slate-400"
          title="Edit Prompt"
          onClick={(e) => e.stopPropagation()} // Prevents navigating to "Details" when clicking edit
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </Link>

        {/* DELETE BUTTON */}
        <button 
          onClick={handleDelete}
          className="bg-white/80 hover:bg-red-500 hover:text-white p-2 rounded-full shadow-sm transition-colors text-slate-400"
          title="Delete Prompt"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* QUICK COPY BUTTON - Top Left */}
      <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <CopyButton text={fullPrompt} />
      </div>

      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            No Media Attached
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">{style}</p>
        <p className="text-sm text-slate-600 line-clamp-2 italic mb-4">"{fullPrompt}"</p>
        
        <Link href={`/prompt/${id}`}>
          <div className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-colors text-center block">
            View Details
          </div>
        </Link>
      </div>
    </div>
  );
}