/**
 * useAIPrompt — fire a pre-filled prompt into the A.E.G.I.S. sidebar from anywhere.
 * Usage: const { openWithPrompt } = useAIPrompt();
 *        openWithPrompt("Explain Stun tag mechanics.");
 */
export function useAIPrompt() {
  const openWithPrompt = (prompt, tab = 'aegis') => {
    window.dispatchEvent(new CustomEvent('aegis:openWithPrompt', { detail: { prompt, tab } }));
  };

  const openGMWithPrompt = (prompt) => openWithPrompt(prompt, 'gm');

  return { openWithPrompt, openGMWithPrompt };
}