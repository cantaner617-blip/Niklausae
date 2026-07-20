import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Loader2, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeEmail } from '../lib/newsletter';

interface NewsletterSubscriptionProps {
  darkMode: boolean;
}

export default function NewsletterSubscription({ darkMode }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await subscribeEmail(email);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
        setEmail('');
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`w-full rounded-3xl border p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
        darkMode
          ? 'bg-[#121214] border-neutral-800/80 text-white shadow-xl'
          : 'bg-white border-neutral-200 text-neutral-800 shadow-sm'
      }`}
      style={{
        boxShadow: darkMode
          ? '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)'
          : '0 10px 40px rgba(0,0,0,0.02)',
      }}
    >
      {/* Absolute decorative glow effects (Dark mode only) */}
      {darkMode && (
        <>
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-violet-600/5 blur-[90px] pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-pink-600/5 blur-[90px] pointer-events-none z-0" />
        </>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Brand & Call to Action */}
        <div className="flex-1 text-left flex gap-4 items-start">
          <div className={`p-3.5 rounded-2xl shrink-0 flex items-center justify-center ${
            darkMode 
              ? 'bg-violet-950/20 text-violet-400 border border-violet-900/30' 
              : 'bg-violet-50 text-violet-600 border border-violet-100'
          }`}>
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-black uppercase tracking-tight">Yeni Efektlerden Haberdar Olun</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Arşive yeni bir <span className="text-violet-400 font-bold">Renk Ayarı (CC)</span>, <span className="text-violet-400 font-bold">Shake</span> veya <span className="text-violet-400 font-bold">Twixtor</span> efekti eklendiğinde anında e-posta bildirimi alın. Spamsiz, dilediğiniz an çıkabilirsiniz.
            </p>
          </div>
        </div>

        {/* Right Side: Subscription Form */}
        <div className="w-full md:w-[320px] shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="E-posta adresiniz..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                disabled={status === 'loading'}
                className={`w-full py-3.5 pl-11 pr-12 rounded-2xl text-xs font-semibold tracking-wide border outline-none transition-all ${
                  darkMode
                    ? 'bg-[#0a0a0c] border-neutral-800 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`absolute right-2 p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  status === 'loading'
                    ? 'bg-transparent text-neutral-400'
                    : 'bg-violet-600 hover:bg-violet-700 text-white hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-violet-600/10'
                }`}
                title="Abone Ol"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Notifications / Status Feedback Message */}
            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10.5px] font-bold leading-tight"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{message}</span>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[10.5px] font-bold leading-tight"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </motion.section>
  );
}
