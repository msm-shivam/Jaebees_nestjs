'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/schemas/auth';
import Link from 'next/link';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    // Mimic API reset password
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center justify-center text-orange-500">
          <CheckCircle2 size={48} className="animate-pulse" />
          <h3 className="mt-4 text-xl font-bold text-white">Password reset complete!</h3>
          <p className="mt-2 text-xs text-zinc-400 max-w-xs">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-all text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-bold">Reset Password</h3>
        <p className="text-xs text-zinc-400">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">New Password</label>
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

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500"
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-[11px] text-red-400">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Updating Password...' : 'Reset Password'}
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
