'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/lib/services/AuthService';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    const res = await AuthService.signup(formData);
    setIsLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md sorayva-glass-card rounded-2xl p-6 sm:p-10 shadow-xl border border-champagne/40">
        
        <div className="mb-6">
          <Link href="/account/login" className="inline-flex items-center text-xs font-sans-fashion tracking-widest text-deep-espresso/60 hover:text-terracotta transition-colors uppercase">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Sign In
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-serif-display text-3xl text-deep-espresso mb-2">Create Account</h1>
          <p className="font-sans-body text-sm text-deep-espresso/70">
            Join SORAYVA for exclusive access and faster checkout.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-sans-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
              Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              className="w-full h-11 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Mobile
              </label>
              <input 
                type="tel" 
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                autoComplete="tel"
                className="w-full h-11 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
                Email
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full h-11 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1 relative">
            <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-deep-espresso/50 hover:text-deep-espresso"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="font-sans-fashion text-[0.65rem] tracking-widest text-deep-espresso/70 uppercase pl-1">
              Confirm Password
            </label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full h-11 bg-white/50 border border-champagne/40 rounded-xl px-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
              required
            />
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer group px-1">
            <div className="relative w-4 h-4 rounded flex items-center justify-center border border-champagne/60 group-hover:border-terracotta transition-colors bg-white/50">
              <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" defaultChecked />
              <div className="w-2 h-2 rounded-sm bg-terracotta opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-[0.7rem] font-sans-body text-deep-espresso/70">Keep me signed in</span>
          </label>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 mt-4 bg-deep-espresso text-warm-ivory rounded-xl font-sans-fashion text-xs font-bold tracking-[0.15em] uppercase hover:bg-terracotta transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

      </div>
    </div>
  );
}
