'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PromptCardProps {
  id: string; // We need the ID to know which one to delete
  title: string;
  subject: string;
  style: string;
  fullPrompt: string;
  imageUrl?: string;
}

export default function PromptCard({ id, title, subject, style, fullPrompt, imageUrl }: PromptCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = confirm(`Are you sure you want to delete "${title}"?`);
    
    if (confirmDelete) {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting prompt: ' + error.message);
      } else {
        // Refresh the page to show the updated list
        router.refresh();
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group relative break-inside-avoid mb-6">
      {/* ... all the other code (Delete button, Image, text, etc.) ... */}
      {/* Delete Button - Top Right */}
      <button 
        onClick={handleDelete}
        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-red-500 hover:text-white p-2 rounded-full shadow-sm transition-colors text-slate-400"
        title="Delete Prompt"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>

      {imageUrl ? (
        <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
        />
        </div>
      ) : (
        <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
      )}
      
      <div className="p-5">
        <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3">{style}</p>
        <p className="text-sm text-slate-600 line-clamp-2 italic mb-4">"{fullPrompt}"</p>
        <Link href={`/prompt/${id}`}>
        <button className="w-full py-2 text-sm font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors">
          View Details
        </button>
        </Link>
      </div>
    </div>
  );
}