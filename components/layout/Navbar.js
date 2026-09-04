'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Brand from '@/components/common/Brand';
import { cn } from '@/utils/client';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Report Issue' },
  { href: '/map', label: 'Live Map' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, status, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      if (pathname === '/report') router.replace('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = (user?.name || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-blue-50 text-navy-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {status === 'ready' && user ? (
            <>
              <Link
                href="/report"
                className="btn btn-blue hidden !rounded-lg px-3.5 py-2 text-[13px] sm:inline-flex"
              >
                <PlusCircle size={15} aria-hidden />
                Report Issue
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-slate-300"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-[110px] truncate text-[13px] font-semibold text-slate-800 sm:block">
                    {user.name || 'Account'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" aria-hidden />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft animate-fade-in-up"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/report"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <PlusCircle size={16} className="text-civic-blue" aria-hidden />
                        Report an Issue
                      </Link>
                      {['MAIN_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role) && (
                        <Link
                          href="/admin/dashboard"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-civic-blue hover:bg-blue-50"
                        >
                          <ShieldCheck size={16} aria-hidden />
                          Admin Console
                        </Link>
                      )}
                      <Link
                        href="/map"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <MapPin size={16} className="text-civic-blue" aria-hidden />
                        Live Civic Map
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <LogOut size={16} aria-hidden />
                        {loggingOut ? 'Signing out…' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden !rounded-lg px-3.5 py-2 text-[13px] sm:inline-flex">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary hidden !rounded-lg px-3.5 py-2 text-[13px] sm:inline-flex">
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden animate-fade-in">
          <ul className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive(link.href)
                      ? 'bg-blue-50 text-navy-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
            {user ? (
              <>
                <span className="flex-1 truncate text-sm text-slate-600">
                  Signed in as <span className="font-semibold text-slate-900">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline px-3 py-1.5 text-[13px]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline flex-1 px-3 py-2 text-[13px]">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary flex-1 px-3 py-2 text-[13px]">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
