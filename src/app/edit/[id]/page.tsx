'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function EditPrompt() {
  const { id } = useParams(); // Grabs the ID from the URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Form States (matching your Add page)
  const [title, setTitle] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. FETCH THE EXISTING DATA
  useEffect(() => {
    const fetchPrompt = async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setTitle(data.title);
        setFullPrompt(data.full_prompt);
        setSubject(data.subject);
        setStyle(data.style);
        setVideoUrl(data.video_url || '');
        setUsageInstructions(data.usage_instructions || '');
      }
      setLoading(false);
    };
    fetchPrompt();
  }, [id, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('prompts')
      .update({
        title,
        full_prompt: fullPrompt,
        subject,
        style,
        video_url: videoUrl,
        usage_instructions: usageInstructions,
      })
      .eq('id', id); // Ensures we only update THIS specific prompt

    if (error) {
      alert('Error updating: ' + error.message);
    } else {
      router.push('/'); // Bounce back to gallery on success
    }
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-white">Loading Prompt Data...</div>;

  return (
    <main className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-500">Edit Prompt</h1>
    <form onSubmit={handleUpdate} className="space-y-6">
    {/* TITLE FIELD */}
    <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input 
        type="text" 
        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        />
    </div>

    {/* SUBJECT & STYLE FIELDS */}
    <div className="grid grid-cols-2 gap-4">
        <div>
        <label className="block text-sm font-medium mb-2">Subject</label>
        <input 
            type="text" 
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
        />
        </div>
        <div>
        <label className="block text-sm font-medium mb-2">Style</label>
        <input 
            type="text" 
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" 
            value={style} 
            onChange={(e) => setStyle(e.target.value)} 
        />
        </div>
    </div>

    {/* YOUTUBE LINK */}
    <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-300">YouTube Video URL (Optional)</label>
        <input
        type="text"
        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        />
    </div>

    {/* USAGE INSTRUCTIONS */}
    <div>
        <label className="block text-sm font-bold text-slate-300 mb-2">Usage Instructions (Flex Guide)</label>
        <textarea 
        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white h-24" 
        value={usageInstructions} 
        onChange={(e) => setUsageInstructions(e.target.value)} 
        />
    </div>

    {/* FULL AI PROMPT */}
    <div>
        <label className="block text-sm font-medium mb-2">Full AI Prompt</label>
        <textarea 
        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md h-32" 
        value={fullPrompt} 
        onChange={(e) => setFullPrompt(e.target.value)} 
        required 
        />
    </div>

    <button type="submit" className="w-full bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
        {loading ? 'Saving Changes...' : 'Update Vault Entry'}
    </button>
    </form>
    </main>
  );
}