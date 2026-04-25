'use client';
import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    // This stops the click from "bubbling up" to the Link/Card
    e.preventDefault();
    e.stopPropagation();
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="bg-slate-900 hover:bg-black text-white text-[10px] font-bold py-1.5 px-3 rounded shadow-lg border border-white/20 transition-all active:scale-95 whitespace-nowrap"
    >
      {copied ? '✓ COPIED' : 'COPY PROMPT'}
    </button>
  );
}