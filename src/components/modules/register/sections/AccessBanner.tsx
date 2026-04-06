import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AccessBannerProps {
  eventId: string
  eventName: string
}

export function AccessBanner({ eventId }: AccessBannerProps) {
  const internalLoginLink = `/guest-login/${eventId}?type=internal`

  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
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
            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white/40 p-10 text-left shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-black/5 backdrop-blur-3xl"
          >
            <div className="bg-halal-primary/10 absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl" />
            <div className="relative flex h-full flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-halal-primary/10 text-halal-primary flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-halal-primary text-[10px] font-black tracking-[0.35em] uppercase opacity-80">
                    Internal Access
                  </p>
                  <h3 className="font-outfit text-3xl font-black tracking-tight text-slate-900 uppercase">
                    Login Internal
                  </h3>
                </div>
              </div>
              <p className="max-w-md text-base leading-relaxed text-slate-500">
                Khusus karyawan dan tamu internal yang sudah terdaftar untuk
                mengakses undangan dan tiket digital.
              </p>
              <Link href={internalLoginLink} className="mt-4">
                <Button
                  size="lg"
                  className="bg-halal-primary hover:bg-halal-primary/90 group w-full rounded-2xl text-white shadow-lg transition-all active:scale-[0.98]"
                >
                  <span className="font-bold">Masuk Sekarang</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
