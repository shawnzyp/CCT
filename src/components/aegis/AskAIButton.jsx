import React from 'react';
import { Bot } from 'lucide-react';
import { useAIPrompt } from './useAIPrompt';

/**
 * Tiny inline button to open A.E.G.I.S. with a pre-filled prompt.
 * <AskAIButton prompt="Explain Stun tag." label="Ask A.E.G.I.S." />
 */
export default function AskAIButton({ prompt, label = 'Ask A.E.G.I.S.', tab = 'aegis', className = '' }) {
  const { openWithPrompt } = useAIPrompt();

  return (
    <button
      onClick={() => openWithPrompt(prompt, tab)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all hover:opacity-80 ${className}`}
      style={{
        color: 'rgba(167,139,250,0.9)',
        borderColor: 'rgba(139,92,246,0.35)',
        background: 'rgba(109,40,217,0.10)',
      }}
    >
      <Bot className="h-2.5 w-2.5" />
      {label}
    </button>
  );
}