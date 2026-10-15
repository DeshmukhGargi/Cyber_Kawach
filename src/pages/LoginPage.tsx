import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password mode
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address format (e.g. name@example.com).');
      return;
    }

    setLoading(true);
    try {
      await login(normalizedEmail, password);
      setSuccessMessage('Successfully signed in. Loading your dashboard...');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 900);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Invalid email or password combination. Please try again.';
      if (err.isNetworkError || err.message?.includes('Network error') || err.message?.includes('network')) {
        msg = 'Network connection failed: Unable to connect to authentication server. Please check your internet connection.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a few minutes before retrying.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('valid email')) {
        msg = 'The format of the email address is invalid.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for password reset.');
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      await resetPassword(resetEmail);
      // Generic secure confirmation
      setResetMessage(
        'If an account exists with this email address, a password reset link has been dispatched to your inbox.'
      );
    } catch (err: any) {
      // Still show the generic safe confirmation to avoid user enumeration
      setResetMessage(
        'If an account exists with this email address, a password reset link has been dispatched to your inbox.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CyberKawachLogo size={48} variant="brand" glow={true} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F8F5] border border-[#B8F2E6] text-[11px] font-mono text-[#176B61] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#176B61]" />
          <span>Secure Authentication</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#183B3A]">
          {isResetMode ? 'Reset Your Password' : 'Sign In to Cyber Kawach'}
        </h1>
        <p className="text-xs text-[#526766] max-w-sm mx-auto leading-relaxed">
          {isResetMode
            ? 'Enter your account email to receive a secure recovery link.'
            : 'Access your persistent scan logs, adaptive fitness scoring, and saved threat assessments.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-6 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Reset Confirmation */}
        {resetMessage && (
          <div className="p-3.5 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] text-xs text-[#183B3A] flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#176B61] mt-0.5" />
            <span className="font-medium">{resetMessage}</span>
          </div>
        )}

        {!isResetMode ? (
          /* Normal Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#183B3A]">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs text-[#183B3A] bg-[#F7FCFA] border border-[#DCEBE7] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#183B3A]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setResetEmail(email);
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-semibold text-[#176B61] hover:text-[#183B3A] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs text-[#183B3A] bg-[#F7FCFA] border border-[#DCEBE7] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#526766] hover:text-[#183B3A] cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCEBE7] text-[#38BDF8] focus:ring-[#38BDF8] cursor-pointer"
                />
                <span className="text-xs text-[#526766]">Remember this browser session</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Forgot Password Form */
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#183B3A]">Account Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs text-[#183B3A] bg-[#F7FCFA] border border-[#DCEBE7] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{resetLoading ? 'Sending link...' : 'Send Password Reset Email'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetMessage(null);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-[#176B61] hover:text-[#183B3A] cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Create Account Link */}
        <div className="pt-4 border-t border-[#DCEBE7] text-center">
          <p className="text-xs text-[#526766]">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-bold text-[#176B61] hover:text-[#183B3A] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
