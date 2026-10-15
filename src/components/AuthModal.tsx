import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setIsResetting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isResetting) {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return;
      }
      setSubmitting(true);
      try {
        await resetPassword(email);
        setSuccessMessage('If an account exists, a reset link was dispatched.');
      } catch {
        setSuccessMessage('If an account exists, a reset link was dispatched.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim();

    if (!normalizedEmail || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address format.');
      return;
    }

    if (authModalMode === 'register') {
      if (!normalizedName || normalizedName.length < 2) {
        setErrorMessage('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify confirmation.');
        return;
      }
      if (!acceptTerms) {
        setErrorMessage('Please accept the Terms of Service to create an account.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (authModalMode === 'login') {
        await login(normalizedEmail, password);
      } else {
        await register(normalizedEmail, password, normalizedName);
      }
      handleClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || (authModalMode === 'login' ? 'Invalid email or password combination.' : 'Registration failed. Please try again.');
      if (err.isNetworkError || err.message?.includes('Network error') || err.message?.includes('network')) {
        msg = 'Network error: Unable to connect to server. Please check your connection.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password combination.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (err.code === 'auth/email-already-in-use' || err.message?.includes('already exists')) {
        msg = 'An account already exists with this email address. Please sign in instead.';
      } else if (err.code === 'auth/weak-password' || err.message?.includes('weak')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('valid email')) {
        msg = 'Invalid email address format.';
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#DCEBE7] p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative mint & sky corner glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#38BDF8]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#B8F2E6]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#526766] hover:text-[#183B3A] hover:bg-[#E8F8F5] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center">
            <CyberKawachLogo size={42} variant="brand" glow={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#183B3A] tracking-tight">
            {isResetting
              ? 'Reset Password'
              : authModalMode === 'login'
              ? 'Sign In to Cyber Kawach'
              : 'Create Free Account'}
          </h2>
          <p className="text-xs text-[#526766] max-w-xs mx-auto">
            {isResetting
              ? 'Receive a secure recovery link in your email inbox.'
              : authModalMode === 'login'
              ? 'Access your saved scan history and threat activity.'
              : 'Save personal scan logs, monitor scam patterns, and stay protected.'}
          </p>
        </div>

        {/* Segmented Mode Selector */}
        {!isResetting && (
          <div className="grid grid-cols-2 p-1 bg-[#F7FCFA] border border-[#DCEBE7] rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-[#38BDF8] text-white shadow-xs font-bold'
                  : 'text-[#526766] hover:text-[#183B3A]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-[#38BDF8] text-white shadow-xs font-bold'
                  : 'text-[#526766] hover:text-[#183B3A]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isResetting && authModalMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#183B3A] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DCEBE7] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 rounded-xl text-xs text-[#183B3A] placeholder:text-[#526766]/60 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#183B3A] uppercase tracking-wider block">
              Email Address
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
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DCEBE7] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 rounded-xl text-xs text-[#183B3A] placeholder:text-[#526766]/60 outline-none transition-all"
              />
            </div>
          </div>

          {!isResetting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#183B3A] uppercase tracking-wider block">
                  Password
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#176B61] hover:underline cursor-pointer font-medium"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526766]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DCEBE7] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 rounded-xl text-xs text-[#183B3A] placeholder:text-[#526766]/60 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#526766] hover:text-[#183B3A] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {!isResetting && authModalMode === 'register' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#183B3A] uppercase tracking-wider block">
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
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DCEBE7] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]/20 rounded-xl text-xs text-[#183B3A] placeholder:text-[#526766]/60 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#526766] hover:text-[#183B3A] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#DCEBE7] text-[#38BDF8] focus:ring-[#38BDF8]"
                  />
                  <span className="text-[11px] text-[#526766] leading-snug">
                    I accept the Terms of Service &amp; Privacy Policy.
                  </span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] transition-all shadow-md shadow-[#38BDF8]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isResetting ? (
              <span>Send Recovery Link</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{authModalMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-5 text-center text-xs text-[#526766]">
          {isResetting ? (
            <button
              type="button"
              onClick={() => setIsResetting(false)}
              className="text-[#176B61] hover:text-[#183B3A] font-bold cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : authModalMode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setErrorMessage(null);
                }}
                className="text-[#176B61] hover:text-[#38BDF8] font-bold underline cursor-pointer"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setErrorMessage(null);
                }}
                className="text-[#176B61] hover:text-[#38BDF8] font-bold underline cursor-pointer"
              >
                Log in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

