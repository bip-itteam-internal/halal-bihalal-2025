'use client'

import { AppLayout } from '@/components/layout/app-layout'
import {
  CalendarDays,
  QrCode,
  Crown,
  Info,
  Settings,
  Users,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { PageHeader } from '@/components/shared/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ProceduresPage() {
  const { role, loading } = useProfile()

  if (loading) {
    return (
      <AppLayout
        header={
          <PageHeader
            title="Loading..."
            subtitle="Menyiapkan panduan prosedur..."
          />
        }
      >
        <div className="space-y-6 p-6">
          <div className="h-32 w-full animate-pulse rounded-xl bg-slate-50" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-slate-50" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      header={
        <PageHeader
          title="Prosedur Operasional"
          subtitle={`Panduan tugas untuk peran ${role?.replace('_', ' ').toUpperCase()}`}
        />
      }
    >
      <div className="flex-1 space-y-6 p-5 pt-0">
        <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-5 duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {role === 'super_admin' && (
            <>
              <Card className="flex flex-col border-none bg-indigo-50/30 shadow-none ring-1 ring-indigo-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20">
                      <Crown className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Manajemen User
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Kontrol akses & pembuatan akun
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {[
                      'Menambahkan user baru melalui menu Users.',
                      'Mengatur role (Super Admin, Admin, atau Staff) sesuai tanggung jawab.',
                      'Melakukan reset password jika user lupa akses.',
                      'Menonaktifkan akun yang sudah tidak bertugas.',
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[11px] leading-relaxed font-medium text-slate-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                          {i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="flex flex-col border-none bg-amber-50/30 shadow-none ring-1 ring-amber-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Konfigurasi Sistem
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Pengaturan global & maintenance
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {[
                      'Melakukan monitoring kesehatan sistem dan database.',
                      'Mengatur parameter global aplikasi.',
                      'Mengevaluasi log aktivitas user untuk audit keamanan.',
                      'Melakukan backup data secara berkala.',
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[11px] leading-relaxed font-medium text-slate-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-amber-600 shadow-sm ring-1 ring-amber-100">
                          {i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {(role === 'admin' || role === 'super_admin') && (
            <>
              <Card className="flex flex-col border-none bg-emerald-50/30 shadow-none ring-1 ring-emerald-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Manajemen Event
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Persiapan data tamu & acara
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {[
                      'Membuat event baru melalui menu Events.',
                      'Masuk ke detail event untuk mengelola tamu spesifik.',
                      'Mengimpor atau menambah tamu langsung di dalam halaman event tersebut.',
                      'Memastikan data tamu sudah sesuai untuk pengiriman undangan.',
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[11px] leading-relaxed font-medium text-slate-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                          {i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="flex flex-col border-none bg-blue-50/30 shadow-none ring-1 ring-blue-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Monitoring & Doorprize
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Pengawasan jalannya acara
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {[
                      'Memantau jumlah kehadiran tamu secara real-time di Dashboard.',
                      'Mengatur list doorprize yang akan diundi.',
                      'Melakukan verifikasi manual jika ada kendala sistem.',
                      'Mengekspor laporan akhir kehadiran.',
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[11px] leading-relaxed font-medium text-slate-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600 shadow-sm ring-1 ring-blue-100">
                          {i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {(role === 'staff' || role === 'admin' || role === 'super_admin') && (
            <>
              <Card className="flex flex-col border-none bg-purple-50/30 shadow-none ring-1 ring-purple-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 ring-1 ring-purple-500/20">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Prosedur Scanner
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Langkah saat tamu tiba di lokasi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {[
                      'Buka menu Scanner pada perangkat mobile.',
                      'Izinkan akses kamera jika diminta browser/sistem.',
                      'Scan QR Code dari tiket digital tamu.',
                      'Pastikan nama tamu muncul dan status berubah menjadi Hadir.',
                      'Berikan instruksi meja & doorprize kepada tamu.',
                    ].map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[11px] leading-relaxed font-medium text-slate-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-purple-600 shadow-sm ring-1 ring-purple-100">
                          {i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="flex flex-col border-dashed border-none bg-slate-50/30 shadow-none ring-1 ring-slate-100/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500 ring-1 ring-slate-500/20">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[14px] font-bold text-slate-900">
                        Pencatatan Manual
                      </CardTitle>
                      <CardDescription className="text-[10px] font-medium text-slate-500">
                        Gunakan jika QR Code bermasalah
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 items-center italic">
                  <p className="text-[11px] leading-relaxed font-medium text-slate-500">
                    Jika tamu tidak membawa tiket atau QR Code rusak, Staff
                    dapat mencari nama tamu secara manual melalui tab{' '}
                    <span className="font-bold text-slate-700">
                      &quot;Input Manual&quot;
                    </span>{' '}
                    di halaman Scanner untuk memverifikasi kehadiran.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-blue-900">
                Bantuan Teknis
              </h4>
              <p className="mt-1.5 text-[11px] leading-relaxed font-medium text-blue-700/80">
                Jika mengalami kendala sistem di luar prosedur di atas (seperti
                error database atau koneksi), segera hubungi{' '}
                <span className="font-bold text-blue-900">tim IT Internal</span>{' '}
                di grup koordinasi atau melalui meja registrasi pusat untuk
                penanganan lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
