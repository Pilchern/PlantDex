import { LayoutGrid, Plus, Sprout, LayoutDashboard } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { KNOWN_USERS, useCurrentUser } from '../lib/useCurrentUser';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/binder', label: 'Binder', icon: LayoutGrid, end: false },
  { to: '/add', label: 'Add Plant', icon: Plus, end: false },
];

export default function Layout() {
  const { user, setUser } = useCurrentUser();

  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Sprout className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">PlantDex</span>
          </div>

          <nav className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 outline-none focus:border-emerald-400"
            aria-label="Current user"
          >
            {KNOWN_USERS.map((name) => (
              <option key={name} value={name} className="bg-slate-900">
                {name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
