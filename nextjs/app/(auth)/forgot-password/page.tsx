'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    // Mimic API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center justify-center text-orange-500">
          <CheckCircle2 size={48} className="animate-pulse" />
          <h3 className="mt-4 text-xl font-bold text-white">Reset link sent!</h3>
          <p className="mt-2 text-xs text-zinc-400 max-w-xs">
            We have emailed a password reset link to your email address. Please check your inbox.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold">Forgot Password</h3>
        <p className="text-xs text-zinc-400">
          Enter your email and we will send you a link to reset your password.
        </p>
      </div>

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

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to login</span>
        </Link>
      </div>
    </div>
  );
}
