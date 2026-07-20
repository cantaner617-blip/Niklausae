import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { FeedbackSubmission } from '../types';
import { saveFeedbackToFirebase, isFirebaseConfigured } from '../lib/firebase';

interface FeedbackFormProps {
  darkMode: boolean;
}

export default function FeedbackForm({ darkMode }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [type, setType] = useState<'öneri' | 'şikâyet'>('öneri');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [history, setHistory] = useState<FeedbackSubmission[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Load previous submissions on mount
  useEffect(() => {
    const stored = localStorage.getItem('pars_mazi_feedback');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse feedback history', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);

    try {
      const newSubmission: FeedbackSubmission = {
        id: Math.random().toString(36).substring(2, 9),
        type,
        subject,
        message,
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        createdAt: new Date().toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ', ' + new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      if (isFirebaseConfigured()) {
        await saveFeedbackToFirebase(newSubmission);
      }

      const updatedHistory = [newSubmission, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('pars_mazi_feedback', JSON.stringify(updatedHistory));

      setIsSuccess(true);
      
      // Reset form
      setSubject('');
      setMessage('');
      setName('');
      setContact('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setShowHistory(false);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        id="feedback-fab-trigger"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_4px_25px_rgba(236,72,153,0.4)] bg-gradient-to-tr from-[#9333ea] via-[#c084fc] to-[#db2777]"
        aria-label="Öneri veya Şikâyet Bildir"
      >
        <span className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
        </span>
      </button>

      {/* Suggestion/Complaint Feedback Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div
            id="feedback-modal-container"
            className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all duration-300 flex flex-col max-h-[90vh] ${
              darkMode
                ? 'bg-[#0d0d10] border-neutral-800 text-white'
                : 'bg-white border-neutral-200 text-neutral-800'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              darkMode ? 'border-neutral-800' : 'border-neutral-100'
            }`}>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-pink-500 font-extrabold uppercase tracking-wider">BİZE ULAŞ</span>
                <h3 className="text-xl font-black tracking-tight mt-1">Görüşün değerli.</h3>
                <p className="text-[10.5px] text-neutral-500 font-medium mt-1">
                  Önerini veya yaşadığın sorunu kısa şekilde anlat.
                </p>
              </div>
              <button
                onClick={handleClose}
                className={`p-2.5 rounded-xl transition-colors ${
                  darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-8 flex flex-col items-center text-center gap-4.5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center animate-[bounce_1s_infinite]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight">Mesajın İletildi!</h4>
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed mt-1.5 max-w-xs mx-auto">
                    Geri bildiriminiz başarıyla Pars Mazi ekibine ulaştırıldı. Editör deneyimini iyileştirmek için çalışmaya devam ediyoruz!
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="py-3 px-4.5 rounded-xl text-xs font-black tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all duration-200 shadow-[0_4px_15px_rgba(168,85,247,0.25)]"
                  >
                    Yeni Mesaj Gönder
                  </button>
                  <button
                    onClick={handleClose}
                    className={`py-3 px-4.5 rounded-xl text-xs font-black tracking-tight border transition-all duration-200 ${
                      darkMode
                        ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              /* Form (Scrollable) */
              <div className="overflow-y-auto p-6 flex flex-col gap-5 scrollbar-thin text-left">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                  
                  {/* Suggestion / Complaint Tab Toggle */}
                  <div className={`grid grid-cols-2 p-1 rounded-xl ${
                    darkMode ? 'bg-neutral-900/60' : 'bg-neutral-100'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setType('öneri')}
                      className={`py-2 rounded-lg text-xs font-black transition-all duration-200 ${
                        type === 'öneri'
                          ? darkMode
                            ? 'bg-[#1c1c24] text-white shadow-md border border-neutral-800'
                            : 'bg-white text-neutral-800 shadow-sm border border-neutral-200/50'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      Öneri
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('şikâyet')}
                      className={`py-2 rounded-lg text-xs font-black transition-all duration-200 ${
                        type === 'şikâyet'
                          ? darkMode
                            ? 'bg-[#1c1c24] text-white shadow-md border border-neutral-800'
                            : 'bg-white text-neutral-800 shadow-sm border border-neutral-200/50'
                          : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      Şikâyet
                    </button>
                  </div>

                  {/* Subject input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Konu</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Örn. İndirme bağlantısı"
                      className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all duration-200 ${
                        darkMode
                          ? 'bg-[#121214] border-neutral-800 text-white focus:border-neutral-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-300'
                      }`}
                    />
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Mesaj</label>
                      <span className="text-[9px] font-bold text-neutral-500 font-mono">{message.length}/1000</span>
                    </div>
                    <textarea
                      required
                      maxLength={1000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Düşünceni buraya yaz..."
                      rows={4}
                      className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all duration-200 resize-none ${
                        darkMode
                          ? 'bg-[#121214] border-neutral-800 text-white focus:border-neutral-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-300'
                      }`}
                    />
                  </div>

                  {/* Name Input (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      İsim <span className="text-[9px] text-neutral-500 lowercase italic">(isteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adın veya kullanıcı adın"
                      className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all duration-200 ${
                        darkMode
                          ? 'bg-[#121214] border-neutral-800 text-white focus:border-neutral-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-300'
                      }`}
                    />
                  </div>

                  {/* Contact Input (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      İletişim <span className="text-[9px] text-neutral-500 lowercase italic">(isteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Discord kullanıcı adı veya e-posta"
                      className={`w-full px-4 py-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all duration-200 ${
                        darkMode
                          ? 'bg-[#121214] border-neutral-800 text-white focus:border-neutral-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-neutral-300'
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-5 rounded-xl text-xs font-black tracking-tight flex items-center justify-center gap-2.5 transition-all duration-200 text-white shadow-[0_4px_18px_rgba(219,39,119,0.25)] bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:scale-[1.01] ${
                      isSubmitting ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                    {isSubmitting ? 'Mesajınız Gönderiliyor...' : 'Mesajı Gönder'}
                  </button>
                </form>

                {/* Submissions History Collapsible */}
                {history.length > 0 && (
                  <div className="mt-2 border-t pt-4 border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className={`flex items-center justify-between w-full text-xs font-bold ${
                        darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        Önceki Gönderileriniz ({history.length})
                      </span>
                      {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showHistory && (
                      <div className="flex flex-col gap-2.5 mt-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        {history.map((sub) => (
                          <div
                            key={sub.id}
                            className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 ${
                              darkMode ? 'bg-neutral-900/40 border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                sub.type === 'öneri'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {sub.type}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500">{sub.createdAt}</span>
                            </div>
                            <h5 className={`text-xs font-bold leading-tight ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                              {sub.subject}
                            </h5>
                            <p className="text-[11px] leading-relaxed text-neutral-500 font-medium">
                              {sub.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
