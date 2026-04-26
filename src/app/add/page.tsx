'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddPrompt() {
  const [title, setTitle] = useState('');
  const [fullPrompt, setFullPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true); // [cite: 5]

  try {
    let fileUrl = '';
    
    // 1. Handle file upload if it exists
    if (file) { // [cite: 6]
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`; // [cite: 7]
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('vault-assets')
        .upload(filePath, file);

      if (uploadError) { // [cite: 8]
        alert('Error uploading file: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('vault-assets')
        .getPublicUrl(filePath); // [cite: 9]
      fileUrl = publicUrl; // 
    }

    // 2. Determine file type for proper column mapping
    const isPdf = file?.type === 'application/pdf';

    // 3. SINGLE INSERT: Save everything at once
    const { error: dbError } = await supabase.from('prompts').insert([
      {
        title,
        full_prompt: fullPrompt,
        subject,
        style,
        // If it's a PDF, put the link in pdf_url, otherwise image_url
        image_url: isPdf ? null : fileUrl,
        pdf_url: isPdf ? fileUrl : null,
        video_url: videoUrl,
        usage_instructions: usageInstructions,
      },
    ]);

    if (dbError) throw dbError; // [cite: 11]

    // 4. Success! Redirect home
    router.push('/'); // [cite: 14]

  } catch (err: any) {
    alert('Error saving data: ' + err.message); // [cite: 13]
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