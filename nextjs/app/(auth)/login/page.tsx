'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/schemas/auth';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        setTimeout(() => router.push('/dashboard'), 100);
      } else {
        setError('Invalid email or password. Please use the credentials shown below.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold">Sign In</h3>
        <p className="text-xs text-zinc-400">Enter your credentials to access the console</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              {...register('email')}
              placeholder="admin@sports-ecommerce.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500"
            />
          </div>
          {errors.email && (
            <span className="text-[11px] text-red-400">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-orange-400 hover:text-orange-300 hover:underline transition"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500"
            />
          </div>
          {errors.password && (
            <span className="text-[11px] text-red-400">{errors.password.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Credentials Box */}
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-3.5 text-xs text-zinc-400">
        <p className="font-semibold text-zinc-300 mb-1">Demo Credentials:</p>
        <p>Email: <code className="text-orange-400">admin@sports-ecommerce.com</code></p>
        <p>Password: <code className="text-orange-400">admin123</code></p>
      </div>
    </div>
  );
}
