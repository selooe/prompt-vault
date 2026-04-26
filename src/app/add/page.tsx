'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr'; // The 2026 standard

export default function AddPrompt() {
  const [title, setTitle] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');
  const router = useRouter();

// Create the client directly in the component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let fileUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vault-assets')
        .getPublicUrl(filePath);
      fileUrl = publicUrl;
    }

    const isPdf = file?.type === 'application/pdf';

    const { error: dbError } = await supabase.from('prompts').insert([
      {
        title,
        full_prompt: fullPrompt,
        subject,
        style,
        image_url: isPdf ? null : fileUrl,
        pdf_url: isPdf ? fileUrl : null,
        video_url: videoUrl,
        usage_instructions: usageInstructions,
      },
    ]);

    if (dbError) throw dbError;
    router.push('/');
  } catch (err: any) {
    alert('Error saving data: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-white">Add New Prompt</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input type="text" className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input type="text" className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <input type="text" className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md" value={style} onChange={(e) => setStyle(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Result (Image or PDF)</label>
          <input 
            type="file" 
            accept="image/*,application/pdf"
            className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md text-sm" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* YOUTUBE LINK INPUT */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-300">YouTube Video URL (Optional)</label>
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <p className="text-xs text-slate-500 italic">Paste the link here to show a video player instead of an image.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Usage Instructions (Flex Guide)</label>
          <textarea 
            placeholder="e.g., 'Change the [Subject] to any aircraft part' or 'Works best with 16:9 aspect ratio'..."
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none h-24" 
            value={usageInstructions} 
            onChange={(e) => setUsageInstructions(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Full AI Prompt</label>
          <textarea className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-md h-32" value={fullPrompt} onChange={(e) => setFullPrompt(e.target.value)} required />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving to Vault...' : 'Save to Vault'}
        </button>
      </form>
    </main>
  );
}