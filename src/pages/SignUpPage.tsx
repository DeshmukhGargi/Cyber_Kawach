import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from '../components/CyberKawachLogo.tsx';

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { register, sendVerificationEmail, user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Validate fields
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!validateEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address format (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match. Please re-enter.');
      return;
    }
    if (!acceptTerms) {
      setErrorMessage('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      await register(normalizedEmail, password, trimmedName);
      try {
        await sendVerificationEmail();
      } catch {
        // Non-blocking verification notice
      }
      setSuccessMessage('Account created successfully! Your personal defense dashboard is ready.');
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1200);
    } catch (err: any) {
      console.error('Registration failed:', err);
      let msg = err.message || 'Registration encountered an error. Please try again.';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('already exists')) {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password' || err.message?.includes('too weak')) {
        msg = 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('valid email')) {
        msg = 'The provided email address format is invalid.';
      } else if (err.isNetworkError || err.message?.includes('Network error') || err.message?.includes('network')) {
        msg = 'Network connection failed: Unable to reach the authentication service. Please check your connection.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
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
          <span>New Account Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#183B3A]">
          Create Your Account
        </h1>
        <p className="text-xs text-[#526766] max-w-sm mx-auto leading-relaxed">
          Unlock your personalized Cyber Fitness Score, adaptive quiz training, and persistent threat telemetry.
        </p>
      </div>

      {/* Main Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#DCEBE7] shadow-xs space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
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
            <div>
              <div className="font-bold">{successMessage}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Redirecting to your dashboard...</div>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#183B3A] flex items-center justify-between">
              <span>Full Name</span>
              <span className="text-[10px] text-[#526766] font-normal">Required</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs text-[#183B3A] bg-[#F7FCFA] border border-[#DCEBE7] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#183B3A] flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-[#526766] font-normal">Required</span>
            </label>
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
            <label className="text-xs font-bold text-[#183B3A] flex items-center justify-between">
              <span>Password</span>
              <span className="text-[10px] text-[#526766] font-normal">Min. 6 characters</span>
            </label>
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

            {/* Quick strength feedback */}
            {password.length > 0 && (
              <div className="pt-1 flex items-center gap-3 text-[10px] font-mono">
                <span className={hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  ✓ 8+ chars
                </span>
                <span className={hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  ✓ Number
                </span>
                <span className={hasLetter ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  ✓ Letter
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#183B3A]">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-xs text-[#183B3A] bg-[#F7FCFA] border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all placeholder:text-slate-400 font-medium ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-rose-300'
                    : 'border-[#DCEBE7]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#526766] hover:text-[#183B3A] cursor-pointer"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="text-[10px] text-rose-500 font-medium">Passwords do not match.</div>
            )}
          </div>

          {/* Accept Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#DCEBE7] text-[#38BDF8] focus:ring-[#38BDF8] cursor-pointer"
              />
              <span className="text-xs text-[#526766] leading-snug">
                I accept the{' '}
                <span className="text-[#176B61] font-semibold underline underline-offset-2">
                  Terms of Service
                </span>{' '}
                and understand that Cyber Kawach is an educational and defense analysis tool.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing User Link */}
        <div className="pt-4 border-t border-[#DCEBE7] text-center">
          <p className="text-xs text-[#526766]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-bold text-[#176B61] hover:text-[#183B3A] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
