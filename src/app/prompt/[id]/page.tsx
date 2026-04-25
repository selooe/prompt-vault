import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import { getYouTubeEmbedUrl } from '@/lib/videoUtils';

// Note the 'Promise' type here for the latest Next.js versions
export default async function PromptDetail({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // We must 'await' the params in modern Next.js
  const { id } = await params;

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

    // This turns the raw YouTube link into a player link
  const embedUrl = getYouTubeEmbedUrl(prompt?.video_url);

  if (error || !prompt) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block font-medium">
          ← Back to Gallery
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-200">
          {embedUrl ? (
            /* 1. Show Video Player */
            <div className="w-full aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : prompt.image_url ? (
            /* 2. Show Image */
            <img 
              src={prompt.image_url} 
              alt={prompt.title} 
              className="w-full max-h-[600px] object-contain mx-auto" 
            />
          ) : prompt.pdf_url ? (
            /* 3. Show PDF Link */
            <div className="p-20 text-center">
              <p className="mb-4 text-slate-500 font-medium">PDF Document Saved</p>
              <a 
                href={prompt.pdf_url} 
                target="_blank" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open PDF File
              </a>
            </div>
          ) : (
            /* 4. Placeholder */
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
                {/* Insert the button right here */}
                <CopyButton text={prompt.full_prompt} />
                <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl whitespace-pre-wrap break-words font-mono text-sm leading-relaxed border border-slate-800">
                  {prompt.full_prompt}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}