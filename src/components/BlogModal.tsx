import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  blogs: BlogPost[];
}

export default function BlogModal({ isOpen, onClose, darkMode, blogs }: BlogModalProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    playSynthesizedSFX('category-click');
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    playSynthesizedSFX('category-click');
  };

  const estimateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 180));
    return `${time} dk okuma`;
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
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`relative w-full max-w-3xl rounded-3xl border overflow-hidden flex flex-col h-[85vh] shadow-2xl ${
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
                {selectedPost ? (
                  <button
                    onClick={handleBackToList}
                    className={`p-2 rounded-xl mr-1 transition-all hover:scale-105 cursor-pointer flex items-center justify-center ${
                      darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black tracking-wide">
                    {selectedPost ? 'Makale Detayı' : 'Pars Blog'}
                  </h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
                    {selectedPost ? 'BİLGİ VE REHBER ARŞİVİ' : 'EDITÖR NOTLARI VE EĞİTİMLER'}
                  </p>
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
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {!selectedPost ? (
                  /* Blog Posts List View */
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 space-y-6"
                  >
                    {blogs.length === 0 ? (
                      <div className="text-center py-20 text-neutral-500 text-sm">
                        Yayınlanmış blog yazısı bulunamadı.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogs.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            className={`group rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full ${
                              darkMode
                                ? 'bg-[#121214] border-neutral-800/80 hover:border-purple-500/30'
                                : 'bg-white border-neutral-200/80 hover:border-purple-500/30'
                            }`}
                            style={{
                              boxShadow: darkMode ? '0 4px 15px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.02)'
                            }}
                          >
                            {/* Image cover */}
                            {post.imageUrl && (
                              <div className="relative w-full h-44 overflow-hidden bg-neutral-900">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <div className="absolute top-3 right-3 bg-purple-600 text-white font-mono font-black tracking-wide text-[9px] px-2.5 py-1 rounded-full uppercase">
                                  REHBER
                                </div>
                              </div>
                            )}

                            {/* Info */}
                            <div className="p-5 flex flex-col flex-1">
                              <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {post.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {estimateReadTime(post.content)}
                                </span>
                              </div>

                              <h4 className="text-sm font-black tracking-wide leading-snug group-hover:text-purple-400 transition-colors">
                                {post.title}
                              </h4>

                              <p className={`text-xs mt-2 flex-1 leading-relaxed font-medium ${
                                darkMode ? 'text-neutral-400' : 'text-neutral-500'
                              }`}>
                                {post.summary}
                              </p>

                              <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2 border-neutral-800/60 text-[11px] text-neutral-400 font-bold">
                                <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-black uppercase">
                                  {post.author.charAt(0)}
                                </div>
                                <span>{post.author}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Blog Post Detail View */
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 md:p-8 space-y-6"
                  >
                    {/* Cover image */}
                    {selectedPost.imageUrl && (
                      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
                        <img
                          src={selectedPost.imageUrl}
                          alt={selectedPost.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5">
                          <span className="bg-purple-600 text-white font-mono font-black tracking-wide text-[9px] px-2.5 py-1 rounded-full uppercase">
                            Yayınlandı
                          </span>
                          <h2 className="text-lg md:text-2xl font-black text-white mt-2 leading-tight">
                            {selectedPost.title}
                          </h2>
                        </div>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className={`flex flex-wrap items-center gap-y-2 gap-x-6 p-4 rounded-xl text-xs font-bold ${
                      darkMode ? 'bg-neutral-900/60 text-neutral-400' : 'bg-neutral-50 text-neutral-600'
                    }`}>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        Yazar: <span className="font-extrabold text-purple-400">{selectedPost.author}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        Tarih: <span className="font-extrabold">{selectedPost.date}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        Süre: <span className="font-extrabold">{estimateReadTime(selectedPost.content)}</span>
                      </span>
                    </div>

                    {/* Summary Callout */}
                    <div className={`p-5 rounded-2xl border-l-4 border-purple-500 leading-relaxed italic text-xs md:text-sm font-semibold ${
                      darkMode ? 'bg-purple-950/10 text-neutral-300' : 'bg-purple-50/50 text-neutral-700'
                    }`}>
                      {selectedPost.summary}
                    </div>

                    {/* Main Content Body */}
                    <div className={`text-sm leading-relaxed font-medium space-y-4 whitespace-pre-line ${
                      darkMode ? 'text-neutral-300' : 'text-neutral-700'
                    }`}>
                      {selectedPost.content}
                    </div>

                    {/* Back Button Footer */}
                    <div className="pt-6 border-t border-neutral-800/60">
                      <button
                        onClick={handleBackToList}
                        className={`px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-[1.02] ${
                          darkMode ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Blog Listesine Geri Dön
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
