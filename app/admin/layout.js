'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, FileText, LogOut, Map, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  let pathname = usePathname();
  let router = useRouter();
  let { user, status, logout } = useAuth();
  let isLogin = pathname === '/admin/login';
  let isAdmin = Boolean(user && ['MAIN_ADMIN', 'DEPARTMENT_ADMIN'].includes(user.role));

  useEffect(() => {
    if (!isLogin && status === 'ready' && !isAdmin) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLogin, status, isAdmin, pathname, router]);

  if (isLogin) return children;
  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking administrator session...</div>;
  if (!isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecting to admin login...</div>;
  }

  let links = [
    { href: '/admin/dashboard', label: 'Dashboard', Icon: BarChart3 },
    { href: '/admin/reports', label: 'Reports', Icon: FileText },
    { href: '/admin/map', label: 'Live map', Icon: Map },
  ];
  if (user.role === 'MAIN_ADMIN') links.push({ href: '/admin/admins', label: 'Sub-admins', Icon: UserPlus });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-navy-950 px-5 py-5 text-white lg:min-h-[calc(100vh-80px)] lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3"><ShieldCheck size={25} className="text-civic-sky" /><div><p className="font-bold">CivicAI</p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Admin console</p></div></div>
          <nav className="mt-8 flex gap-2 overflow-x-auto lg:block lg:space-y-2">
            {links.map(({ href, label, Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold whitespace-nowrap ${pathname.startsWith(href) ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{label}</Link>)}
          </nav>
          <button className="mt-8 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white" onClick={async () => { await logout(); router.replace('/admin/login'); }}><LogOut size={17} />Log out</button>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
