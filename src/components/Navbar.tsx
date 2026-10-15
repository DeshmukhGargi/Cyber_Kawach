import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  History,
  Search,
  Info,
  Gamepad2,
  Cpu,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LogIn,
  LayoutDashboard,
  UserPlus,
} from 'lucide-react';
import { CyberKawachLogo } from './CyberKawachLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  scanHistoryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  scanHistoryCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, logout, openLoginModal, openRegisterModal } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseNavItems = [
    { id: 'home', label: 'Home', icon: ShieldCheck },
    ...(user ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'detection', label: 'Scan', icon: Search },
    { id: 'how-it-works', label: 'How It Works', icon: Cpu },
    { id: 'scenarios', label: 'Scenarios & Quiz', icon: Gamepad2 },
    { id: 'history', label: 'Scan History', icon: History, badge: scanHistoryCount > 0 ? scanHistoryCount : undefined },
    { id: 'about', label: 'About', icon: Info },
  ];

  const navItems = baseNavItems;

  const handleNavClick = (pageId: string) => {
    if (pageId === 'how-it-works') {
      setActivePage('home');
      setMobileMenuOpen(false);
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    setActivePage(pageId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#DCEBE7] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Logo & Wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] rounded-xl py-1 px-1.5 transition-transform cursor-pointer"
          >
            {/* Cyber Kawach Distinctive Logo */}
            <div className="relative">
              <CyberKawachLogo size={36} variant="brand" glow={true} />
            </div>

            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#183B3A] group-hover:text-[#176B61] transition-colors flex items-center gap-1.5">
                <span>Cyber Kawach</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
              </span>
              <span className="text-[10px] font-semibold text-[#176B61] tracking-wider uppercase">
                Click Smart. Stay Safe.
              </span>
            </div>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs font-semibold tracking-wide">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-1.5 px-1 rounded-md transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] cursor-pointer ${
                    isActive
                      ? 'text-[#183B3A] font-bold'
                      : 'text-[#526766] hover:text-[#183B3A]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                        isActive
                          ? 'bg-[#E8F8F5] text-[#176B61] border-[#B8F2E6]'
                          : 'bg-slate-100 text-[#526766] border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#38BDF8] rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Auth Profile / Sign In + Scan Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-[#DCEBE7] bg-white hover:bg-[#E8F8F5] text-[#183B3A] transition-all text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#38BDF8] text-white flex items-center justify-center font-bold text-[11px]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#526766]" />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DCEBE7] p-2 z-50 animate-in fade-in-20 duration-150 space-y-1">
                    <div className="px-3 py-2 border-b border-[#DCEBE7]/60">
                      <div className="text-xs font-bold text-[#183B3A] truncate">{displayName}</div>
                      <div className="text-[11px] text-[#526766] truncate">{displayEmail}</div>
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6]">
                        {scanHistoryCount} scan{scanHistoryCount === 1 ? '' : 's'} logged
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#183B3A] hover:bg-[#E8F8F5] hover:text-[#176B61] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#176B61]" />
                      <span>User Dashboard</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('history')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#183B3A] hover:bg-[#E8F8F5] hover:text-[#176B61] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <History className="w-4 h-4 text-[#176B61]" />
                      <span>My Scan History</span>
                    </button>

                    <button
                      onClick={async () => {
                        await logout();
                        setUserDropdownOpen(false);
                        if (activePage === 'dashboard') {
                          handleNavClick('home');
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#183B3A] hover:text-[#176B61] border border-[#DCEBE7] hover:bg-[#E8F8F5] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#176B61]" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#176B61] bg-[#B8F2E6] hover:bg-[#A2E8D9] border border-[#A2E8D9] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#176B61]" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Glowing Scan CTA Button in Sky Blue */}
            <button
              onClick={() => handleNavClick('detection')}
              className="px-4 py-2 text-xs font-bold tracking-wide text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm shadow-[#38BDF8]/25 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <button
                onClick={openLoginModal}
                className="px-2.5 py-1 text-xs font-semibold text-[#183B3A] border border-[#DCEBE7] rounded-lg hover:bg-[#E8F8F5]"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#183B3A] hover:bg-[#E8F8F5] border border-[#DCEBE7] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#38BDF8]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Glassmorphism Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DCEBE7] bg-white/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in fade-in-20 duration-150">
          {/* Mobile User Profile info */}
          {user ? (
            <div className="p-3 rounded-xl bg-[#E8F8F5] border border-[#B8F2E6] mb-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#183B3A]">{displayName}</div>
                <div className="text-[11px] text-[#176B61]">{displayEmail}</div>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                  if (activePage === 'dashboard') {
                    handleNavClick('home');
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2 px-3 text-xs font-semibold text-[#183B3A] border border-[#DCEBE7] rounded-xl hover:bg-[#E8F8F5] text-center cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="w-full py-2 px-3 text-xs font-bold text-[#176B61] bg-[#B8F2E6] border border-[#A2E8D9] rounded-xl text-center cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#E8F8F5] text-[#176B61] border border-[#B8F2E6] font-bold'
                    : 'text-[#526766] hover:bg-[#E8F8F5] hover:text-[#183B3A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-[#526766]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#B8F2E6] text-[#176B61] border border-[#176B61]/20'
                        : 'bg-slate-100 text-[#526766] border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('detection')}
              className="w-full text-center py-2.5 px-4 text-xs font-bold text-white bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-xl shadow-md shadow-[#38BDF8]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Scan</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
