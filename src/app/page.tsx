import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PromptCard from '@/components/PromptCard';

// This tells Next.js to fetch fresh data on every visit
export const revalidate = 0; 

export default async function Home() {
  // 1. Fetch data from Supabase
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">Error loading prompts: {error.message}</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Prompt Vault</h1>
          <p className="text-slate-500">My personal AI generation archive</p>
        </div>
        <Link href="/add">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            + Add New Prompt
          </button>
        </Link>
      </header>

      <div className="max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {prompts && prompts.length > 0 ? (
          prompts.map((item) => (
            // Inside the prompts.map((item) => ( ... ))
          <PromptCard 
            key={item.id}
            id={item.id} // Add this line!
            title={item.title}
            subject={item.subject}
            style={item.style}
            fullPrompt={item.full_prompt}
            imageUrl={item.image_url}
          />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-slate-400">
            <p className="text-xl mb-4">Your vault is empty.</p>
            <Link href="/add" className="text-blue-600 underline">
              Click here to add your first AI prompt.
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}