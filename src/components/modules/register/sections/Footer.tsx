'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function Footer({ logoUrl }: { logoUrl?: string }) {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-black/5 py-24 md:py-32">
      {/* Background Decor - Consistency with all sections */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Modern Islamic Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay grayscale"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/islamic-exercise.png")`,
            backgroundSize: '400px',
          }}
        />

        {/* Cinematic Subtle Glow */}
        <div className="bg-halal-primary/10 absolute -bottom-1/2 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full opacity-10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <div className="relative drop-shadow-[0_0_15px_rgba(var(--halal-primary-rgb),0.3)]">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Footer Logo"
                width={140}
                height={56}
                className="h-14 w-auto opacity-40 contrast-125 grayscale"
              />
            ) : (
              <Image
                src="/Logo/LOGO A.png"
                alt="Footer Logo"
                width={140}
                height={56}
                className="h-14 w-auto opacity-40 contrast-125 grayscale"
              />
            )}
          </div>
        </motion.div>

        <div className="mb-12 flex flex-wrap justify-center gap-x-12 gap-y-6 text-xs font-black tracking-[0.4em] text-slate-500 uppercase">
          <a
            href="https://wa.me/6289676258026"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-halal-primary transition-all hover:tracking-[0.5em]"
          >
            Kontak Panitia: 0896-7625-8026 (FARIZ)
          </a>
        </div>

        <div className="space-y-4">
          <p className="font-serif text-sm text-slate-400 italic">
            &copy; 2026 Bharata Group. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
