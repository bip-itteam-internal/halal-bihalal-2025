'use client'

import { useEffect, useState } from 'react'
import { Download, Laptop, Smartphone, X } from 'lucide-react'
import { usePWAInstall } from '@/hooks/use-pwa-install'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PWAInstallModal() {
  const { isInstallable, isInstalled, install } = usePWAInstall()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if we should show the modal (e.g., after login)
    const shouldShow = sessionStorage.getItem('showPwaModal') === 'true'
    if (shouldShow && isInstallable && !isInstalled) {
      setOpen(true)
      sessionStorage.removeItem('showPwaModal')
    }
  }, [isInstallable, isInstalled])

  const handleInstall = async () => {
    await install()
    setOpen(false)
  }

  if (isInstalled) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden rounded-[24px] border-none bg-white p-0 shadow-2xl sm:max-w-[340px]">
        {/* Compact Color Header Area */}
        <div className="bg-primary relative flex h-[110px] items-center justify-center">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/60 transition-colors hover:text-white"
          >
            <X className="h-5 w-5 stroke-[2.5px]" />
          </button>

          <div className="rounded-[18px] border border-white/30 bg-white/20 p-3.5 shadow-inner backdrop-blur-md">
            <Download className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Compact Content Section Area */}
        <div className="px-6 pt-5 pb-6 text-center">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-[18px] leading-tight font-bold text-[#0f172a]">
              Pasang Aplikasi Mobile
            </DialogTitle>
            <DialogDescription className="text-[12px] leading-relaxed font-medium text-slate-400">
              Instal aplikasi Halal Bihalal untuk akses lebih cepat, dan stabil.
            </DialogDescription>
          </DialogHeader>

          {/* Compact Platform Choice Cards */}
          <div className="mt-5 mb-6 grid grid-cols-2 gap-3">
            <div className="group flex cursor-default flex-col items-center justify-center gap-2 rounded-[18px] border border-slate-100 bg-[#f8fafc] p-3.5 transition-all">
              <Smartphone className="h-5 w-5 text-[#10b981]" />
              <span className="text-[10px] font-bold text-slate-500">
                Android & iOS
              </span>
            </div>
            <div className="group flex cursor-default flex-col items-center justify-center gap-2 rounded-[18px] border border-slate-100 bg-[#f8fafc] p-3.5 transition-all">
              <Laptop className="h-5 w-5 text-[#3b82f6]" />
              <span className="text-[10px] font-bold text-slate-500">
                PC & Laptop
              </span>
            </div>
          </div>

          {/* Compact Action Buttons Container */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
            >
              Nanti saja
            </Button>

            <Button
              onClick={handleInstall}
            >
              Pasang Sekarang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
