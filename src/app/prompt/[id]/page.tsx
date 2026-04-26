'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import CopyButton from '@/components/CopyButton';
import { getYouTubeEmbedUrl } from '@/lib/videoUtils';

export default function PromptDetail() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDetail = async () => {
      // 1. Check Auth (Keep the vault private)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Fetch data using the authenticated session
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setPrompt(data);
      }
      setLoading(false);
    };

    if (id) fetchDetail();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!prompt) {
    return <div className="p-20 text-center text-slate-400">Prompt not found or access denied.</div>;
  }

  const embedUrl = getYouTubeEmbedUrl(prompt.video_url);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block font-medium">
          ← Back to Gallery
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-200">
            {embedUrl ? (
              <div className="w-full aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : prompt.image_url ? (
              <img 
                src={prompt.image_url} 
                alt={prompt.title} 
                className="w-full max-h-[600px] object-contain mx-auto" 
              />
            ) : prompt.pdf_url ? (
              <div className="p-20 text-center">
                <p className="mb-4 text-slate-500 font-medium">Technical Document Saved</p>
                <a 
                  href={prompt.pdf_url} 
                  target="_blank" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open PDF File
                </a>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No media attached
              </div>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{prompt.title}</h1>
            
            <div className="flex gap-4 mb-8">
              <div className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-600">
                <span className="font-semibold">Subject:</span> {prompt.subject || 'N/A'}
              </div>
              <div className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-600">
                <span className="font-semibold">Style:</span> {prompt.style || 'N/A'}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">The Prompt</h2>
              <div className="relative group">
                <CopyButton text={prompt.full_prompt} />
                <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl whitespace-pre-wrap break-words font-mono text-sm leading-relaxed border border-slate-800">
                  {prompt.full_prompt}
                </pre>
              </div>
            </div>

            {prompt.usage_instructions && (
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <h3>Usage & Customization Guide</h3>
                </div>
                <p className="text-amber-900 leading-relaxed whitespace-pre-wrap italic">
                  {prompt.usage_instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}