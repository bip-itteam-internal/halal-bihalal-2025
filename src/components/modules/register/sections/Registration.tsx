import { motion } from 'framer-motion'

export function Registration() {
  return (
    <section className="relative z-10 w-full overflow-hidden py-16 md:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-20 space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/40 px-5 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-2xl"
          >
            <div className="bg-halal-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
              Join The Celebration
            </span>
          </motion.div>

          <h2 className="font-outfit relative flex flex-col items-center justify-center gap-2 text-5xl font-black tracking-tighter uppercase md:text-8xl">
            <span className="text-slate-900">TERBUKA UNTUK UMUM</span>
            <span className="text-halal-primary relative drop-shadow-[0_10px_25px_rgba(245,158,11,0.3)]">
              FREE HTM
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'circOut' }}
                className="bg-halal-primary/40 absolute -bottom-2 left-0 h-2 rounded-full blur-[2px]"
              />
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-600 md:text-xl">
            Bharata{' '}
            <span className="font-bold text-slate-900">
              Spesial Konser Setia Band 2026 Gratis
            </span>{' '}
            tanpa perlu proses pendaftaran.
          </p>
        </div>
      </div>
    </section>
  )
}
