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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let fileUrl = '';

    // 1. If there's a file, upload it first
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('vault-assets')
        .upload(filePath, file);

      if (uploadError) {
        alert('Error uploading file: ' + uploadError.message);
        setLoading(false);
        return;
      }

      // Get the Public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('vault-assets')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrl;
    }

    // 2. Save everything to the Database
    const isPdf = file?.type === 'application/pdf';
    
    const { error } = await supabase
      .from('prompts')
      .insert([{ 
        title, 
        full_prompt: fullPrompt, 
        subject, 
        style,
        image_url: isPdf ? null : fileUrl,
        pdf_url: isPdf ? fileUrl : null
      }]);

    if (error) {
      alert('Error saving data: ' + error.message);
    } else {
      router.push('/'); 
    }
    setLoading(false);
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