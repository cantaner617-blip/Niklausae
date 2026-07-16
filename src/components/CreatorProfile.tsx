import React, { useState } from 'react';
import { Youtube, Instagram, MessageSquare, Play, X, Eye, ExternalLink } from 'lucide-react';
import { PORTFOLIO_VIDEOS } from '../data';
import parsMaziPortrait from '../assets/images/pars_mazi_portrait_1784209992091.jpg';

interface CreatorProfileProps {
  darkMode: boolean;
}

export default function CreatorProfile({ darkMode }: CreatorProfileProps) {
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <section id="creator-section" className="w-full py-8">
      {/* Container Card */}
      <div className={`w-full p-6 md:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-[#131317] to-[#0c0c0e] border-neutral-800 text-white'
          : 'bg-gradient-to-b from-white to-neutral-50 border-neutral-200 text-neutral-800'
      }`}
      style={{ boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.03)' }}
      >
        {/* Header Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
          <span className={`text-[10px] font-black tracking-widest uppercase ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            PARSMAZI / CREATIVE PROFILE
          </span>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Creator Portrait Column */}
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group shadow-2xl border border-neutral-800/20 bg-neutral-900">
            {/* The generated creator image */}
            <img
              src={parsMaziPortrait}
              alt="Pars Mazi"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
            
            {/* Image Overlay Text */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col text-left">
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest">
                VIDEO EDITOR • MOTION DESIGNER
              </span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight mt-1.5 font-sans">
                PARS MAZI
              </h3>
            </div>
          </div>

          {/* Description & Stats Column */}
          <div className="flex flex-col text-left gap-6 h-full justify-center">
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>01 / CREATOR</span>
              
              {/* Heading */}
              <div className="relative mt-2">
                <h2 className="text-4xl font-black tracking-tight leading-none uppercase select-none relative z-10 flex flex-col">
                  <span className={`text-neutral-500/10 text-5xl font-extrabold block absolute -top-4 -left-1 ${darkMode ? 'text-white/5' : 'text-neutral-900/5'}`}>
                    WHO AM I
                  </span>
                  BEN KİMİM?
                </h2>
              </div>

              {/* Separator Line */}
              <div className="flex items-center w-full mt-4 mb-4">
                <div className="h-[2px] w-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
                <div className="w-2.5 h-2.5 rotate-45 border border-pink-500 mx-1.5 bg-[#0c0c0e] shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                <div className="h-[2px] flex-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full" />
              </div>

              <p className={`text-xs leading-relaxed font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Merhaba! Ben Pars Mazi. 6 yılı aşkın süredir After Effects ve Premiere Pro platformlarında profesyonel video kurgu, 3D animasyon ve hareket tasarımı (motion design) yapıyorum.
                <br /><br />
                Siz editörler için hazırladığım bu canlı kütüphanede, kurgularınızı profesyonel seviyeye çıkaracak renk derecelendirmeleri (CC), pürüzsüz dikey/yatay shake'ler, akıcı Twixtor yavaş çekim ayarları ve geçiş efektleri gibi her editörün arşivinde bulunması gereken en kaliteli hazır ayarları (presets) paylaşıyorum.
              </p>
            </div>

            {/* Quick Skills Stats Cards */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {/* Stat 1 */}
              <div className={`p-3.5 rounded-xl border flex flex-col text-left gap-0.5 leading-tight ${
                darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <span className="text-lg font-black tracking-tight text-red-500 font-mono">6+</span>
                <span className="text-[8.5px] font-extrabold tracking-wider text-neutral-500 uppercase mt-0.5">YILLIK DENEYİM</span>
              </div>
              {/* Stat 2 */}
              <div className={`p-3.5 rounded-xl border flex flex-col text-left gap-0.5 leading-tight ${
                darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <span className="text-lg font-black tracking-tight text-purple-400 font-mono">Ae</span>
                <span className="text-[8.5px] font-extrabold tracking-wider text-neutral-500 uppercase mt-0.5">MOTION DESIGN</span>
              </div>
              {/* Stat 3 */}
              <div className={`p-3.5 rounded-xl border flex flex-col text-left gap-0.5 leading-tight ${
                darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                <span className="text-lg font-black tracking-tight text-blue-400 font-mono">Pr</span>
                <span className="text-[8.5px] font-extrabold tracking-wider text-neutral-500 uppercase mt-0.5">VİDEO KURGU</span>
              </div>
            </div>

            {/* View Portfolio Button */}
            <button
              id="view-portfolio-btn"
              onClick={() => setIsPortfolioOpen(true)}
              className="w-full py-3.5 px-6 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 text-white cursor-pointer hover:scale-[1.01] bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.4)]"
            >
              PORTFÖYÜ İNCELE
            </button>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3.5 mt-2 justify-center md:justify-start">
              {/* Youtube */}
              <a
                id="social-youtube"
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 text-red-500 hover:text-white bg-red-500/5 hover:bg-red-500 border-red-500/20 hover:border-red-500 hover:scale-105"
              >
                <Youtube className="w-5 h-5 fill-current" />
              </a>
              {/* Instagram */}
              <a
                id="social-instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 text-pink-500 hover:text-white bg-pink-500/5 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 border-pink-500/20 hover:border-pink-500 hover:scale-105"
              >
                <Instagram className="w-5 h-5" />
              </a>
              {/* Discord */}
              <a
                id="social-discord"
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 text-indigo-400 hover:text-white bg-indigo-500/5 hover:bg-[#5865F2] border-indigo-500/20 hover:border-[#5865F2] hover:scale-105"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
              </a>
              {/* TikTok */}
              <a
                id="social-tiktok"
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105 ${
                  darkMode
                    ? 'text-white hover:text-[#000] bg-white/5 hover:bg-white border-white/10 hover:border-white'
                    : 'text-neutral-800 hover:text-white bg-neutral-100 hover:bg-black border-neutral-200 hover:border-black'
                }`}
              >
                {/* Simple Custom TikTok styled Icon with Lucide Play for safety */}
                <Play className="w-4 h-4 fill-current transform rotate-45" />
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Portfolio Showcase Modal */}
      {isPortfolioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsPortfolioOpen(false)} />
          
          <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all duration-300 flex flex-col max-h-[85vh] ${
            darkMode ? 'bg-[#0d0d10] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              darkMode ? 'border-neutral-800' : 'border-neutral-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black uppercase tracking-tight">Pars Mazi • Portfolyo</h3>
                  <p className="text-[10px] text-neutral-500 font-medium">After Effects Kurgu ve Motion Tasarım Gösterimi</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsPortfolioOpen(false);
                  setSelectedVideo(null);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
              {selectedVideo ? (
                /* Video Player Mode */
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className={`text-xs font-black flex items-center gap-2 self-start py-1.5 px-3 rounded-lg border transition-all ${
                      darkMode ? 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    ← Listeye Geri Dön
                  </button>

                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-neutral-800/40">
                    <iframe
                      src={selectedVideo.videoUrl}
                      title={selectedVideo.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="text-left">
                    <span className="text-[9px] text-red-500 font-extrabold uppercase">{selectedVideo.category}</span>
                    <h4 className="text-lg font-black mt-1 leading-tight">{selectedVideo.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {selectedVideo.views} İzlenme</span>
                      <span>Süre: {selectedVideo.duration}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid list Mode */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PORTFOLIO_VIDEOS.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`group rounded-2xl border overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                        darkMode ? 'bg-[#121214] border-neutral-800 hover:border-neutral-700' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Thumbnail with overlay hover play button */}
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                        {/* Duration tag */}
                        <span className="absolute bottom-3 right-3 bg-black/80 text-[10px] text-white font-mono px-2 py-0.5 rounded font-black">
                          {video.duration}
                        </span>
                      </div>

                      {/* Video info */}
                      <div className="p-4 flex flex-col gap-1.5 text-left">
                        <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest">{video.category}</span>
                        <h4 className={`text-sm font-black leading-snug line-clamp-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-neutral-500 mt-1 font-mono">
                          {video.views} izlenme
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t text-center text-xs flex justify-between items-center px-6 ${
              darkMode ? 'border-neutral-800' : 'border-neutral-100'
            }`}>
              <span className="text-[10px] text-neutral-500 font-bold">Pars Mazi • Kurgu Kütüphanesi</span>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] text-red-500 font-black hover:underline flex items-center gap-1"
              >
                Tümünü YouTube\'da Gör <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
