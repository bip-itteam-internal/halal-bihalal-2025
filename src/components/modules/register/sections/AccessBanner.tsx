import Link from 'next/link'
import { motion } from 'framer-motion'
import slugify from 'slugify'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AccessBannerProps {
  eventName: string
}

export function AccessBanner({ eventName }: AccessBannerProps) {
  const eventSlug = slugify(eventName || '', {
    lower: true,
    strict: true,
  })
  const internalLoginLink = `/guest-login/${eventSlug}?type=internal`


  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      <div className="bg-halal-primary/10 absolute top-0 left-1/2 -z-10 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full opacity-40 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <p className="text-halal-primary text-[10px] font-black tracking-[0.5em] uppercase">
            Akses Khusus
          </p>
        </div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-[#102224] to-[#0a1b1a] p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
          >
            <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative flex h-full flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.35em] text-sky-300/80 uppercase">
                    Internal Access
                  </p>
                  <h3 className="text-2xl font-black text-white uppercase">
                    Login Internal
                  </h3>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-zinc-300">
                Khusus karyawan dan tamu internal yang sudah terdaftar untuk
                mengakses undangan dan tiket.
              </p>
              <Link href={internalLoginLink} className="mt-auto">
                <Button
                  size="lg"
                  className="w-full rounded-2xl bg-sky-400 text-[#071416] hover:bg-sky-300"
                >
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
