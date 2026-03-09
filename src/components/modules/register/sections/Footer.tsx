'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function Footer({ logoUrl }: { logoUrl?: string }) {
  return (
    <footer className="bg-halal-secondary-dark relative z-10 w-full border-t border-white/5 px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Footer Logo"
              width={140}
              height={56}
              className="h-14 w-auto opacity-30 grayscale"
            />
          ) : (
            <Image
              src="/logo/LOGO A.png"
              alt="Footer Logo"
              width={140}
              height={56}
              className="h-14 w-auto opacity-30 grayscale"
            />
          )}
        </motion.div>

        <div className="mb-12 flex flex-wrap justify-center gap-x-12 gap-y-6 text-xs font-black tracking-[0.3em] text-slate-500 uppercase">
          <a
            href="https://wa.me/6289676258026"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-halal-primary transition-colors"
          >
            Kontak Panitia: 0896-7625-8026 (FARIZ)
          </a>
        </div>

        <div className="space-y-4">
          <p className="font-serif text-sm text-slate-600 italic">
            &copy; 2026 Bharata Group.
          </p>
        </div>
      </div>
    </footer>
  )
}
