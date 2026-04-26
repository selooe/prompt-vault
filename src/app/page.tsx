'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added missing import
import PromptCard from '@/components/PromptCard'; // Added missing import
import { supabase } from '@/lib/supabase';

export default function Home() {
  // 1. All necessary states
  const [prompts, setPrompts] = useState<any[]>([]); // Added missing state
  const [searchTerm, setSearchTerm] = useState(''); // Added missing state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 2. Single secure effect: Check Auth then Fetch Data
  useEffect(() => {
    const initializeVault = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // User is authenticated, now fetch the prompts
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPrompts(data);
      }
      setLoading(false);
    };

    initializeVault();
  }, [router, supabase]);

  // 3. Search logic
  const filteredPrompts = prompts.filter((p) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(searchStr) ||
      p.subject?.toLowerCase().includes(searchStr) ||
      p.full_prompt?.toLowerCase().includes(searchStr)
    );
  });

  // 4. Clean Loading State (Centered Spinner)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 5. Main UI (Private Gallery)
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">PROMPT VAULT</h1>
            <p className="text-slate-500 mt-1 font-medium">Your private repository of AI wisdom.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* LOGOUT BUTTON */}
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login'); // Immediate bounce to login
              }}
              className="text-slate-400 hover:text-red-500 font-bold transition-colors text-sm px-4"
            >
              Logout
            </button>

            <Link href="/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 text-center">
              + New Prompt
            </Link>
          </div>
        </div>

        {/* SEARCH BAR SECTION */}
        <div className="relative max-w-2xl mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search titles, subjects, or keywords..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* MASONRY GALLERY */}
        {filteredPrompts.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                id={prompt.id}
                title={prompt.title}
                subject={prompt.subject}
                style={prompt.style}
                fullPrompt={prompt.full_prompt}
                imageUrl={prompt.image_url}
                videoUrl={prompt.video_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">No prompts found matching "{searchTerm}"</p>
          </div>
        )}
      </div> 
    </main>
  );
}