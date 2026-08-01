import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, BookOpen, Clock, Calendar, User, Eye, ArrowRight, Share2, Sparkles, AlertCircle } from 'lucide-react';
import { BlogPost } from '../types';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface BlogViewProps {
  darkMode: boolean;
  blogs: BlogPost[];
  onBack: () => void;
}

export default function BlogView({ darkMode, blogs, onBack }: BlogViewProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const selectedPost = blogs.find(p => p.id === selectedPostId);

  // Extract tags/categories automatically or define default ones
  const categories = ['all', ...Array.from(new Set(blogs.map(b => b.author.includes('Pars') ? 'Eğitsel' : 'İnceleme')))];

  const getPostCategory = (post: BlogPost) => {
    return post.title.toLowerCase().includes('render') || post.title.toLowerCase().includes('ayar') 
      ? 'Teknik' 
      : 'Eğitsel';
  };

  const getEstimatedReadingTime = (content: string) => {
    const wordCount = content.split(/\s+/).length;
    const time = Math.ceil(wordCount / 180); // Average reading speed
    return `${time} dk okuma`;
  };

  const handleShare = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/blog/${post.id}`);
    setCopiedPostId(post.id);
    playSynthesizedSFX('theme-toggle-light');
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const filteredBlogs = blogs.filter(post => {
    if (activeCategory === 'all') return true;
    return getPostCategory(post) === activeCategory;
  });

  // Pick first blog as feature post on home view
  const featurePost = blogs[0];
  const regularPosts = blogs.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col gap-6"
    >
      <AnimatePresence mode="wait">
        {!selectedPostId ? (
          // BLOGS LIST ARCHIVE VIEW
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6 text-left"
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
                Pars Editörlük Okulu
              </span>
            </div>

            {/* Header Title */}
            <div className="flex flex-col gap-1">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-violet-500 shrink-0" />
                Pars Blog & Editör Kütüphanesi
              </h1>
              <p className="text-[11px] text-neutral-500 max-w-xl font-medium">
                Video kurgularınızı sinematik seviyeye ulaştırmak için pratik teknikler, sektör ipuçları ve After Effects öğretici yazıları.
              </p>
            </div>

            {/* Hero Featured Article (If blogs exist) */}
            {featurePost && (
              <div
                onClick={() => {
                  setSelectedPostId(featurePost.id);
                  playSynthesizedSFX('category-click');
                }}
                className={`group w-full rounded-3xl border overflow-hidden cursor-pointer transition-all duration-500 flex flex-col md:flex-row ${
                  darkMode
                    ? 'bg-[#101012]/80 border-neutral-800 hover:border-neutral-700 shadow-xl'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
                }`}
              >
                {/* Article Kapak */}
                <div className="md:w-1/2 h-56 md:h-72 overflow-hidden relative shrink-0">
                  <img
                    src={featurePost.imageUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000'}
                    alt={featurePost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-violet-600 text-white text-[8px] font-black tracking-widest uppercase py-1 px-3 rounded-full border border-violet-500/30 font-mono shadow-md">
                    ÖNE ÇIKAN YAZI
                  </div>
                </div>

                {/* Article Details */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-3">
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3.5 text-neutral-500 text-[9px] font-mono font-black">
                      <span className="flex items-center gap-1.5 text-violet-400">
                        <User className="w-3.5 h-3.5" />
                        {featurePost.author.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {featurePost.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {getEstimatedReadingTime(featurePost.content)}
                      </span>
                    </div>

                    <h2 className={`text-base md:text-xl font-black uppercase leading-tight tracking-tight transition-colors group-hover:text-purple-400 ${
                      darkMode ? 'text-white' : 'text-neutral-900'
                    }`}>
                      {featurePost.title}
                    </h2>

                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                      {featurePost.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-dashed border-neutral-800/40">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
                      OKUMAYA BAŞLA <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    <button
                      onClick={(e) => handleShare(featurePost, e)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer text-xs ${
                        darkMode 
                          ? 'border-neutral-800 hover:bg-neutral-850 hover:text-white text-neutral-500' 
                          : 'border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800 text-neutral-500'
                      }`}
                    >
                      {copiedPostId === featurePost.id ? 'KOPYALANDI!' : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Divider with Categories */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between border-b border-neutral-800/30 pb-2">
                <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider font-mono">
                  Tüm Makaleler ({filteredBlogs.length})
                </span>
                
                {/* Category Pills */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'all', label: 'TÜMÜ' },
                    { id: 'Eğitsel', label: 'EĞİTSEL' },
                    { id: 'Teknik', label: 'TEKNİK' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        playSynthesizedSFX('category-click');
                      }}
                      className={`py-1 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                          : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid layout for remaining posts */}
              {filteredBlogs.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  Bu kategoride yayınlanmış yazı bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBlogs.map(post => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedPostId(post.id);
                        playSynthesizedSFX('category-click');
                      }}
                      className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col ${
                        darkMode
                          ? 'bg-[#101012]/60 border-neutral-850 hover:border-neutral-800 shadow-sm hover:shadow-md'
                          : 'bg-white border-neutral-200 hover:border-neutral-350 shadow-sm'
                      }`}
                    >
                      {/* Kapak */}
                      <div className="h-44 w-full overflow-hidden relative">
                        <img
                          src={post.imageUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000'}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-2.5 rounded-full font-mono border border-neutral-800/60">
                          {getPostCategory(post)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2.5 text-neutral-500 text-[8.5px] font-mono font-black">
                            <span className="text-violet-400">{post.author}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>

                          <h3 className={`text-sm font-extrabold uppercase leading-snug tracking-tight group-hover:text-purple-400 transition-colors ${
                            darkMode ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {post.title}
                          </h3>

                          <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                            {post.summary}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-neutral-850/40 mt-1">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-violet-400 transition-colors flex items-center gap-1">
                            DETAYI OKU <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>

                          <button
                            onClick={(e) => handleShare(post, e)}
                            className="p-1.5 text-neutral-500 hover:text-white cursor-pointer"
                          >
                            {copiedPostId === post.id ? 'KOPYALANDI!' : <Share2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // DETAILED POST VIEW (GORGEOUS READING EXPERIENCE)
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6 text-left"
          >
            {/* Top Back Action Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800/40 pb-4">
              <button
                onClick={() => {
                  playSynthesizedSFX('category-click');
                  setSelectedPostId(null);
                }}
                className={`group py-2.5 px-4 rounded-2xl border text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  darkMode
                    ? 'bg-[#121214] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Blog Listesine Dön
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleShare(selectedPost!, e)}
                  className={`py-2 px-3.5 rounded-2xl border transition-all cursor-pointer text-xs font-black tracking-wider uppercase flex items-center gap-1.5 ${
                    darkMode 
                      ? 'bg-[#121214] border-neutral-800 hover:bg-neutral-850 hover:text-white text-neutral-400' 
                      : 'bg-white border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 text-neutral-600'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  {copiedPostId === selectedPost!.id ? 'BAĞLANTI KOPYALANDI!' : 'PAYLAŞ'}
                </button>
              </div>
            </div>

            {/* Main Article Container */}
            {selectedPost && (
              <article className="flex flex-col gap-6">
                {/* Image Header */}
                <div className="w-full h-64 md:h-[400px] rounded-3xl overflow-hidden border border-neutral-800/40 relative shrink-0">
                  <img
                    src={selectedPost.imageUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000'}
                    alt={selectedPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Floating badge details */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                    <span className="self-start px-3 py-1 bg-violet-600 text-white text-[8px] font-black tracking-widest uppercase rounded-full border border-violet-500/30 font-mono">
                      {getPostCategory(selectedPost)}
                    </span>
                    <h1 className="text-xl md:text-3xl font-black uppercase text-white leading-tight tracking-tight">
                      {selectedPost.title}
                    </h1>
                  </div>
                </div>

                {/* Meta details with author */}
                <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                  darkMode ? 'bg-[#101012] border-neutral-850' : 'bg-neutral-50 border-neutral-150'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-black uppercase tracking-wider text-xs">
                      PM
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className={`text-xs font-extrabold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                        {selectedPost.author}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold mt-0.5">Yazar • Pars Mazi</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-neutral-500 text-[10px] font-mono font-black">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {selectedPost.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {getEstimatedReadingTime(selectedPost.content)}
                    </span>
                  </div>
                </div>

                {/* Article Typography Content */}
                <div className={`text-sm leading-relaxed font-medium flex flex-col gap-5 ${
                  darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {/* Render paragraphs cleanly */}
                  {selectedPost.content.split('\n\n').map((paragraph, index) => {
                    const cleanP = paragraph.trim();
                    if (!cleanP) return null;

                    // Style lists or bullet points
                    if (cleanP.startsWith('•') || cleanP.startsWith('-')) {
                      return (
                        <ul key={index} className="list-disc pl-6 flex flex-col gap-1.5 my-1">
                          {cleanP.split('\n').map((li, liIndex) => (
                            <li key={liIndex} className="text-xs md:text-sm font-semibold text-neutral-400">
                              {li.replace(/^[•\-\s]+/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Style tips / boxes
                    if (cleanP.toUpperCase().startsWith('İPUCU:') || cleanP.toUpperCase().startsWith('TIP:') || cleanP.toUpperCase().startsWith('ÖNEMLİ:')) {
                      return (
                        <div
                          key={index}
                          className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 text-xs md:text-sm text-neutral-300 my-2 flex gap-3 text-left leading-relaxed font-semibold"
                        >
                          <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black text-purple-400 uppercase tracking-wide block mb-1">PRO İPUCU</span>
                            {cleanP.replace(/^(İPUCU|TIP|ÖNEMLİ):?\s*/i, '')}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p key={index} className="text-xs md:text-sm leading-relaxed tracking-wide font-normal">
                        {cleanP}
                      </p>
                    );
                  })}
                </div>

                {/* Editor Notes signature */}
                <div className="mt-8 pt-6 border-t border-dashed border-neutral-800/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black tracking-widest text-neutral-500 uppercase">
                    © PARS MAZI EDİTÖR AKADEMİSİ
                  </span>

                  <button
                    onClick={() => {
                      playSynthesizedSFX('category-click');
                      setSelectedPostId(null);
                    }}
                    className="text-xs font-black uppercase text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Tüm Makaleleri Gör →
                  </button>
                </div>
              </article>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
