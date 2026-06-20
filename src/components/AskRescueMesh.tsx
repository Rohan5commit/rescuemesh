import { useAppStore } from '../store/useAppStore';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertTriangle, CheckCircle2, HelpCircle, FileSearch } from 'lucide-react';
import clsx from 'clsx';

const SUGGESTED_QUESTIONS = [
  'What should I do first?',
  'What risks matter most?',
  'Which protocol section covers this?',
  'What information is still missing?',
  'What should I tell the next responder?',
];

export function AskRescueMesh() {
  const activeCase = useAppStore((s) => s.activeCase);
  const qaHistory = useAppStore((s) => s.qaHistory);
  const askingQA = useAppStore((s) => s.askingQA);
  const askQuestion = useAppStore((s) => s.askQuestion);
  const [question, setQuestion] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory]);

  if (!activeCase) {
    return <div className="text-center py-20"><p className="text-navy-400">No active case.</p></div>;
  }

  const handleAsk = (q?: string) => {
    const toAsk = q || question.trim();
    if (!toAsk) return;
    askQuestion(toAsk);
    setQuestion('');
  };

  return (
    <div className="max-w-3xl animate-slide-in flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Ask RescueMesh</h1>
        <p className="text-sm text-navy-400">Grounded Q&A from local case context and knowledge packs</p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 mb-4 min-h-[300px]">
        {qaHistory.length === 0 && !askingQA && (
          <div className="text-center py-12">
            <HelpCircle className="w-10 h-10 text-navy-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Suggested Questions</h3>
            <div className="space-y-2 max-w-md mx-auto">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="card w-full text-left text-sm text-gray-300 hover:bg-navy-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {qaHistory.map((entry, idx) => (
          <div key={idx} className="space-y-3">
            {/* Question */}
            <div className="flex justify-end">
              <div className="bg-rescue-600/20 border border-rescue-700/30 rounded-xl px-4 py-2 max-w-[80%]">
                <p className="text-sm text-gray-200">{entry.question}</p>
              </div>
            </div>
            {/* Answer */}
            <div className="flex justify-start">
              <div className="card max-w-[90%]">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch className="w-4 h-4 text-rescue-400" />
                  <span className="text-xs font-medium text-navy-300">RescueMesh</span>
                  {entry.response.hasSufficientEvidence ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  )}
                  <span className="text-[10px] text-navy-500">
                    Confidence: {(entry.response.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{entry.response.answer}</p>
                {/* Evidence Sources */}
                {entry.response.evidence.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-navy-700">
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Sources</p>
                    <div className="space-y-1">
                      {entry.response.evidence.slice(0, 3).map((e) => (
                        <div key={e.id} className="text-xs text-navy-400 bg-navy-800/50 rounded px-2 py-1">
                          <span className="text-navy-300">[{e.source}]</span>{' '}
                          {e.documentName && <span className="text-navy-300">{e.documentName}</span>}
                          <span className="ml-1">— {e.excerpt.slice(0, 80)}...</span>
                          <span className="text-navy-500 ml-1">({(e.similarity * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {askingQA && (
          <div className="flex justify-start">
            <div className="card flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-rescue-400 animate-spin" />
              <span className="text-sm text-navy-300">Thinking locally...</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask a question about this incident..."
          className="input-field flex-1"
          disabled={askingQA}
        />
        <button onClick={() => handleAsk()} disabled={!question.trim() || askingQA} className="btn-primary">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
