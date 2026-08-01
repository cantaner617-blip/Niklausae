import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, ChevronRight, ChevronDown, ChevronUp, Search, MessageSquare, BookOpen, ShieldAlert, Zap, Cpu } from 'lucide-react';
import { FaqItem } from '../types';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface FaqViewProps {
  darkMode: boolean;
  faqs: FaqItem[];
  onBack: () => void;
  onOpenFeedback: () => void;
}

export default function FaqView({ darkMode, faqs, onBack, onOpenFeedback }: FaqViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'installation' | 'presets' | 'general'>('all');

  const toggleFaq = (id: string) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
      playSynthesizedSFX('category-click');
    }
  };

  // Group or classify FAQs for high realism
  const getCategorizedFaq = (faq: FaqItem) => {
    const q = faq.question.toLowerCase();
    if (q.includes('kurulum') || q.includes('nasıl kurulur') || q.includes('dosya') || q.includes('plugin')) {
      return 'installation';
    }
    if (q.includes('shake') || q.includes('preset') || q.includes('cc') || q.includes('renk') || q.includes('twixtor')) {
      return 'presets';
    }
    return 'general';
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const faqCategory = getCategorizedFaq(faq);
    const matchesCategory = activeCategory === 'all' || faqCategory === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col gap-6"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            playSynthesizedSFX('category-click');
            onBack();
          }}
          className={`group py-2.5 px-4 rounded-2xl border text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            darkMode
              ? 'bg-[#121214] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Ana Sayfaya Dön
        </button>

        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-500">
          Pars Yardım Merkezi
        </span>
      </div>

      {/* Hero Header */}
      <div 
        className={`relative p-8 md:p-12 rounded-[28px] border overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-300 ${
          darkMode 
            ? 'bg-[#101012] border-neutral-800/80' 
            : 'bg-gradient-to-tr from-purple-50/20 via-white to-pink-50/20 border-neutral-200'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Glowing Ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 mb-4 border border-purple-500/15">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase">Sana Nasıl Yardımcı Olabiliriz?</h1>
        <p className="text-xs text-neutral-500 max-w-md mt-2 font-medium leading-relaxed">
          Presets kurulumlarından plugin uyumluluğuna, teknik problemlerden genel sorulara kadar tüm cevaplar burada.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-md mt-6 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bir konu, soru veya hata mesajı arayın..."
            className={`w-full py-3.5 pl-11 pr-4 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all ${
              darkMode
                ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600'
                : 'bg-white border-neutral-200 text-neutral-800 placeholder:text-neutral-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-500 hover:text-purple-400 font-mono uppercase cursor-pointer"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Main FAQ Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Categories Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider font-mono mb-1 text-left px-2">Kategoriler</span>
          {[
            { id: 'all', label: 'TÜM SORULAR', icon: HelpCircle, color: 'text-purple-500' },
            { id: 'installation', label: 'KURULUM VE AYAR', icon: Cpu, color: 'text-blue-500' },
            { id: 'presets', label: 'EFEKT & PRESETS', icon: Zap, color: 'text-amber-500' },
            { id: 'general', label: 'GENEL SORULAR', icon: ShieldAlert, color: 'text-emerald-500' }
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  playSynthesizedSFX('category-click');
                }}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left text-xs font-black transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15 scale-[1.02]'
                    : darkMode
                      ? 'bg-[#101012] hover:bg-neutral-850 border border-neutral-850/60 text-neutral-400 hover:text-white'
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : cat.color}`} />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="md:col-span-3 flex flex-col gap-3 text-left">
          <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider font-mono mb-1 px-1">
            {searchQuery ? `Arama Sonuçları (${filteredFaqs.length})` : 'Sıkça Sorulan Sorular'}
          </span>

          {filteredFaqs.length === 0 ? (
            <div className={`p-10 rounded-2xl border text-center text-xs font-semibold ${
              darkMode ? 'bg-[#101012] border-neutral-850 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-500'
            }`}>
              Aramanıza uygun bir soru veya cevap bulunamadı. Lütfen başka anahtar kelimeler deneyin.
            </div>
          ) : (
            filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              const faqCat = getCategorizedFaq(faq);
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? darkMode
                        ? 'bg-[#101012] border-purple-500/30 shadow-[0_4px_25px_rgba(168,85,247,0.03)]'
                        : 'bg-purple-50/20 border-purple-200 shadow-[0_4px_25px_rgba(168,85,247,0.01)]'
                      : darkMode
                        ? 'bg-[#101012]/50 border-neutral-850/60 hover:border-neutral-800'
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-extrabold text-sm transition-all cursor-pointer select-none"
                  >
                    <span className={isOpen ? 'text-purple-400 font-black' : darkMode ? 'text-white' : 'text-neutral-850'}>
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-lg transition-all shrink-0 ${
                      isOpen
                        ? 'bg-purple-500/10 text-purple-400'
                        : darkMode
                          ? 'bg-neutral-900 text-neutral-500'
                          : 'bg-neutral-50 text-neutral-500'
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
                        <div className={`px-5 pb-5 pt-1 text-xs leading-relaxed font-medium border-t border-dashed ${
                          darkMode 
                            ? 'text-neutral-300 border-neutral-800/60' 
                            : 'text-neutral-600 border-neutral-150'
                        }`}>
                          {faq.answer}
                          
                          {/* Tag badges */}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 font-mono border border-purple-500/10">
                              {faqCat === 'installation' ? 'Kurulum' : faqCat === 'presets' ? 'Presets' : 'Genel'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-neutral-500/10 text-neutral-400 font-mono">
                              Öncelikli {faq.order}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Real-time Support Callout */}
      <div 
        className={`p-6 rounded-[24px] border flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-left transition-all ${
          darkMode 
            ? 'bg-[#101012] border-neutral-850' 
            : 'bg-gradient-to-r from-purple-50/10 to-pink-50/10 border-neutral-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide">Aradığınız Cevabı Bulamadınız Mı?</h4>
            <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-normal max-w-md">
              Hala sorun mu yaşıyorsunuz? Bize direkt kontrol panelinden sorun bildirebilir veya öneri gönderebilirsiniz. 24 saat içinde cevaplıyoruz.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playSynthesizedSFX('category-click');
            onOpenFeedback();
          }}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-purple-600/10 active:scale-95 transition-all shrink-0"
        >
          Destek Bildirimi Gönder
        </button>
      </div>
    </motion.div>
  );
}
