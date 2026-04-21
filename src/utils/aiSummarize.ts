declare global {
  interface Window {
    puter: {
      ai: {
        chat: (msg: string, opts?: { model?: string }) => Promise<string | { message?: { content?: string } }>;
      };
    };
  }
}

export async function summarizeNews(title: string, summary: string, maxWords: number = 50): Promise<string> {
  try {
    if (!window.puter?.ai?.chat) {
      return `${title}. ${summary.slice(0, maxWords * 6)}...`;
    }

    const prompt = `Summarize this news in exactly one concise sentence (max ${maxWords} words), suitable for verbal delivery:\n\nTitle: ${title}\nContent: ${summary}`;
    const result = await window.puter.ai.chat(prompt);

    if (typeof result === 'string') {
      return result.slice(0, maxWords * 8);
    }
    if (result?.message?.content) {
      return result.message.content.slice(0, maxWords * 8);
    }
    return summary.slice(0, maxWords * 6) + '...';
  } catch (err) {
    console.error('Summarization error:', err);
    return summary.slice(0, maxWords * 6) + '...';
  }
}

export async function reasonAboutData(context: string, question: string): Promise<string> {
  try {
    if (!window.puter?.ai?.chat) {
      return `Processing: ${question}`;
    }

    const systemPrompt = `You are A.R.C.H.I.E., an intelligent agentic engine. Analyze the following context and answer the user's question in 2-3 sentences, concisely and accurately.`;
    const prompt = `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${question}`;
    const result = await window.puter.ai.chat(prompt);

    if (typeof result === 'string') {
      return result.slice(0, 500);
    }
    if (result?.message?.content) {
      return result.message.content.slice(0, 500);
    }
    return 'Analysis complete.';
  } catch (err) {
    console.error('Reasoning error:', err);
    return 'Unable to process at this time.';
  }
}
