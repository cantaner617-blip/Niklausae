import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FaqItem } from '../types';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  faqs: FaqItem[];
}

export default function FaqModal({ isOpen, onClose, darkMode, faqs }: FaqModalProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
      playSynthesizedSFX('category-click');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden flex flex-col max-h-[85vh] shadow-2xl ${
              darkMode 
                ? 'bg-[#0d0d0f] border-neutral-800 text-white' 
                : 'bg-white border-neutral-200 text-neutral-800'
            }`}
          >
            {/* Header */}
            <div className={`p-6 flex items-center justify-between border-b ${
              darkMode ? 'border-neutral-900 bg-[#0d0d0f]' : 'border-neutral-100 bg-neutral-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">Sıkça Sorulan Sorular</h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">YARDIM VE DESTEK MERKEZİ</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all hover:scale-105 cursor-pointer ${
                  darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
              {faqs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  Kayıtlı soru bulunamadı.
                </div>
              ) : (
                faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-2xl border transition-all duration-300 ${
                        isOpen
                          ? darkMode
                            ? 'bg-[#121214] border-purple-500/30'
                            : 'bg-purple-50/40 border-purple-200'
                          : darkMode
                            ? 'bg-[#121214]/40 border-neutral-800/80 hover:border-neutral-800'
                            : 'bg-neutral-50/40 border-neutral-100 hover:border-neutral-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left font-extrabold text-sm transition-all cursor-pointer"
                      >
                        <span className={isOpen ? 'text-purple-400 font-black' : ''}>
                          {faq.question}
                        </span>
                        <div className={`p-1.5 rounded-lg transition-all ${
                          isOpen
                            ? 'bg-purple-500/10 text-purple-400'
                            : darkMode
                              ? 'bg-neutral-900 text-neutral-500'
                              : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className={`px-5 pb-5 pt-1 text-xs leading-relaxed font-medium ${
                              darkMode ? 'text-neutral-300' : 'text-neutral-600'
                            }`}>
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t text-center text-[10px] text-neutral-500 font-semibold uppercase tracking-wider ${
              darkMode ? 'border-neutral-900' : 'border-neutral-100'
            }`}>
              Cevabını bulamadınız mı? Bize admin panelinden veya geri bildirim formundan ulaşın.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
