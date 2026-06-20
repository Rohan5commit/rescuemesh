import { useAppStore } from '../store/useAppStore';
import { useState, useRef } from 'react';
import {
  FileText, Mic, Image, FileUp, Trash2, Brain, Loader2, Plus, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';

type InputType = 'text' | 'voice' | 'image' | 'document';

const INPUT_ICONS: Record<InputType, typeof FileText> = {
  text: FileText,
  voice: Mic,
  image: Image,
  document: FileUp,
};

export function IntakeScreen() {
  const activeCase = useAppStore((s) => s.activeCase);
  const updateActiveCase = useAppStore((s) => s.updateActiveCase);
  const runAssessment = useAppStore((s) => s.runAssessment);
  const assessing = useAppStore((s) => s.assessing);
  const setScreen = useAppStore((s) => s.setScreen);

  const [textInput, setTextInput] = useState('');
  const [addingText, setAddingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!activeCase) {
    return (
      <div className="text-center py-20">
        <p className="text-navy-400">No active case. Create one first.</p>
      </div>
    );
  }

  const addText = () => {
    if (!textInput.trim()) return;
    const newInput = {
      id: uuid(),
      caseId: activeCase.id,
      type: 'text' as InputType,
      content: textInput,
      metadata: { createdAt: new Date().toISOString() },
    };
    updateActiveCase({ inputs: [...activeCase.inputs, newInput] });
    setTextInput('');
  };

  const addVoiceNote = async () => {
    // In production, this would use Web Audio API + QVAC transcribe
    const fakeTranscription = 'Simulated voice note: There is smoke visible from the second floor of Building 3. Two people are trapped on the third floor balcony. Fire trucks have not yet arrived. Strong smell of burning plastic.';
    const newInput = {
      id: uuid(),
      caseId: activeCase.id,
      type: 'voice' as InputType,
      content: fakeTranscription,
      metadata: { duration: 15, createdAt: new Date().toISOString() },
    };
    updateActiveCase({ inputs: [...activeCase.inputs, newInput] });
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newInput = {
      id: uuid(),
      caseId: activeCase.id,
      type: 'image' as InputType,
      content: `[Image: ${file.name}] Description pending multimodal analysis. The image shows a structural scene relevant to the incident.`,
      metadata: { filename: file.name, mimeType: file.type, size: file.size, createdAt: new Date().toISOString() },
    };
    updateActiveCase({ inputs: [...activeCase.inputs, newInput] });
    e.target.value = '';
  };

  const addDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newInput = {
      id: uuid(),
      caseId: activeCase.id,
      type: 'document' as InputType,
      content: `[Document: ${file.name}] Content would be extracted and indexed for RAG retrieval during local processing.`,
      metadata: { filename: file.name, mimeType: file.type, size: file.size, createdAt: new Date().toISOString() },
    };
    updateActiveCase({ inputs: [...activeCase.inputs, newInput] });
    e.target.value = '';
  };

  const removeInput = (inputId: string) => {
    updateActiveCase({ inputs: activeCase.inputs.filter((i) => i.id !== inputId) });
  };

  const handleAssess = async () => {
    await runAssessment();
    setScreen('action-plan');
  };

  return (
    <div className="max-w-3xl animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Incident Intake</h1>
        <p className="text-sm text-navy-400">Add inputs to: <span className="text-gray-300">{activeCase.title}</span></p>
      </div>

      {/* Input Methods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button onClick={() => setAddingText(!addingText)} className="card hover:bg-navy-800 transition-colors text-center">
          <FileText className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <span className="text-xs text-gray-300">Text Note</span>
        </button>
        <button onClick={addVoiceNote} className="card hover:bg-navy-800 transition-colors text-center">
          <Mic className="w-6 h-6 text-green-400 mx-auto mb-1" />
          <span className="text-xs text-gray-300">Voice Note</span>
        </button>
        <button onClick={() => imageInputRef.current?.click()} className="card hover:bg-navy-800 transition-colors text-center">
          <Image className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <span className="text-xs text-gray-300">Image</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="card hover:bg-navy-800 transition-colors text-center">
          <FileUp className="w-6 h-6 text-orange-400 mx-auto mb-1" />
          <span className="text-xs text-gray-300">Document</span>
        </button>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={addImage} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={addDocument} />

      {/* Text Input Area */}
      {addingText && (
        <div className="card-elevated mb-6 animate-slide-in">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Describe what you observe at the incident scene..."
            className="input-field w-full h-24 resize-none mb-2"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddingText(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={addText} disabled={!textInput.trim()} className="btn-primary text-sm">Add Note</button>
          </div>
        </div>
      )}

      {/* Existing Inputs */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-semibold text-navy-300 uppercase tracking-wider">Case Inputs ({activeCase.inputs.length})</h3>
        {activeCase.inputs.length === 0 && (
          <div className="card text-center py-8">
            <Plus className="w-8 h-8 text-navy-500 mx-auto mb-2" />
            <p className="text-sm text-navy-400">No inputs yet. Add text, voice, images, or documents above.</p>
          </div>
        )}
        {activeCase.inputs.map((inp) => {
          const Icon = INPUT_ICONS[inp.type];
          return (
            <div key={inp.id} className="card flex items-start gap-3 animate-slide-in">
              <Icon className="w-4 h-4 text-navy-400 mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-navy-300 uppercase">{inp.type}</span>
                  {inp.metadata.filename && (
                    <span className="text-xs text-navy-500">{inp.metadata.filename}</span>
                  )}
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">{inp.content}</p>
              </div>
              <button onClick={() => removeInput(inp.id)} className="text-navy-500 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Assess Button */}
      {activeCase.inputs.length > 0 && (
        <button
          onClick={handleAssess}
          disabled={assessing}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {assessing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing incident locally...</>
          ) : (
            <><Brain className="w-4 h-4" /> Run Assessment & Generate Action Plan <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
