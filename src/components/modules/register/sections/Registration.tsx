import { motion } from 'framer-motion'

export function Registration() {
  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      {/* Background Decor */}
      <div className="bg-halal-primary/10 absolute top-0 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full opacity-50 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-halal-primary/20 bg-halal-primary/5 inline-flex items-center gap-2 rounded-full border px-5 py-2 ring-1 ring-white/5 backdrop-blur-2xl"
          >
            <div className="bg-halal-primary h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_8px_rgba(var(--halal-primary-rgb),0.8)]" />
            <span className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
              Join The Celebration
            </span>
          </motion.div>

          <h2 className="font-outfit relative flex flex-col items-center justify-center gap-2 text-5xl font-black tracking-tighter uppercase md:text-8xl">
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              TERBUKA UNTUK UMUM
            </span>
            <span className="text-halal-primary relative drop-shadow-[0_10px_30px_rgba(var(--halal-primary-rgb),0.5)]">
              FREE HTM
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'circOut' }}
                className="bg-halal-primary/40 absolute -bottom-2 left-0 h-2 rounded-full blur-[2px]"
              />
            </span>
          </h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="group relative mx-auto mt-4 px-8 py-3"
          >
            {/* Soft Glow Background */}
            <div className="bg-halal-primary/5 group-hover:bg-halal-primary/10 absolute inset-0 -z-10 blur-xl transition-all duration-500" />

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <div className="via-halal-primary/30 h-px w-8 bg-gradient-to-r from-transparent to-transparent" />
                <span className="font-outfit text-2xl font-black tracking-tighter text-white md:text-4xl">
                  KUOTA 1000 ORANG
                </span>
                <div className="via-halal-primary/30 h-px w-8 bg-gradient-to-r from-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-zinc-400/80 md:text-xl">
            Bharata spesial{' '}
            <span className="font-medium text-white">
              konser Setia Band 2026
            </span>{' '}
            gratis tanpa perlu proses pendaftaran.
          </p>
        </div>
      </div>
    </section>
  )
}
