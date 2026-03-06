'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Loader2, User, KeyRound, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)
    setAuthError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (loginError) {
      setAuthError(loginError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute -top-[10%] -left-[5%] h-[60%] w-[50%] rounded-full bg-blue-900/40 blur-[100px]" />
      <div className="pointer-events-none absolute -right-[5%] -bottom-[10%] h-[60%] w-[50%] rounded-full bg-emerald-900/30 blur-[100px]" />

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-10 px-6">
        {/* Logo/Brand Area */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
            <Sparkles className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h1 className="font-heading bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-5xl">
              Halal Bihalal 2025
            </h1>
            <p className="text-lg font-medium text-slate-400">
              Management Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="overflow-hidden rounded-[2rem] border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 px-8 pt-10 pb-8">
            <CardTitle className="font-heading text-2xl font-black text-white">
              Login
            </CardTitle>
            <CardDescription className="border-b border-white/10 pb-4 text-base text-slate-400">
              Enter your specialized credentials to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-black tracking-widest text-emerald-400 uppercase"
                  >
                    Identifier
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-emerald-500" />
                    </div>
                    <Input
                      id="email"
                      {...register('email')}
                      type="email"
                      placeholder="admin@example.com"
                      className="h-14 rounded-2xl border-white/10 bg-black/30 pl-12 text-white transition-all placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:bg-black/50 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm font-medium text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-xs font-black tracking-widest text-emerald-400 uppercase"
                  >
                    Security Key
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <KeyRound className="h-5 w-5 text-emerald-500" />
                    </div>
                    <Input
                      id="password"
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl border-white/10 bg-black/30 pr-12 pl-12 font-medium text-white transition-all placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:bg-black/50 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-white focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm font-medium text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-center text-sm font-bold text-red-400">
                    {authError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-4 h-16 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-lg font-black tracking-tight text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  'Authenticate Access'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-xs font-bold tracking-[0.3em] text-slate-600 uppercase">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  )
}
