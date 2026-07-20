import React from 'react';
import { X, Play, Download, ShieldCheck } from 'lucide-react';
import { RequiredPlugin } from '../types';

interface RequiredPluginsModalProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  plugins: RequiredPlugin[];
}

export default function RequiredPluginsModal({ darkMode, isOpen, onClose, plugins }: RequiredPluginsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div 
        id="plugins-modal-container"
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all duration-300 flex flex-col max-h-[85vh] ${
          darkMode 
            ? 'bg-[#0d0d10] border-neutral-800 text-white' 
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-neutral-800' : 'border-neutral-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Gerekli Pluginler</h3>
              <p className="text-[10px] text-neutral-500 font-medium">After Effects Edit Paketlerinin Çalışması İçin Gerekli Eklentiler</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Plugins List (Scrollable) */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
          <div className={`p-4 rounded-2xl flex items-start gap-3.5 border ${
            darkMode ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-800'
          }`}>
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              Efektlerin (Preset) After Effects programınızda sorunsuz, hata vermeden açılması ve düzgün çalışması için aşağıdaki üçüncü parti eklentilerin sisteminizde kurulu olması gerekmektedir.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {plugins.map((plugin) => (
              <div 
                key={plugin.id || plugin.name}
                className={`p-5 rounded-2xl border flex flex-col gap-3.5 transition-all duration-200 hover:scale-[1.01] ${
                  darkMode 
                    ? 'bg-[#121214] border-neutral-800 hover:border-neutral-700' 
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h4 className={`text-base font-black tracking-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {plugin.name}
                    </h4>
                    <span className="text-[10px] text-amber-500 font-bold uppercase mt-0.5">
                      {plugin.category}
                    </span>
                  </div>
                  
                  <div className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider ${
                    darkMode ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-white text-neutral-500 border border-neutral-200'
                  }`}>
                    {plugin.requirements}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-neutral-400 font-medium">
                  {plugin.description}
                </p>

                <div className="flex items-center gap-2.5 mt-1">
                  <a
                    href={plugin.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black tracking-tight border transition-all duration-200 ${
                      darkMode
                        ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Kurulum Videosu
                  </a>
                  
                  {plugin.downloadUrl && plugin.downloadUrl !== '#' ? (
                    <a
                      href={plugin.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black tracking-tight bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)] text-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Plugin İndir
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        alert(`${plugin.name} indirme bağlantısı simüle edildi!`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black tracking-tight bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Plugin İndir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-center text-[10px] text-neutral-500 font-bold ${
          darkMode ? 'border-neutral-800' : 'border-neutral-100'
        }`}>
          ParsMaziPack • Eklentiler tamamen ücretsiz kurgulanmıştır
        </div>
      </div>
    </div>
  );
}
