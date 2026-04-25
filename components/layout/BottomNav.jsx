import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, Briefcase, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/explore', icon: Search, label: 'Esplora' },
  { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/me', icon: User, label: 'Profilo' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all duration-200 select-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5 pointer-events-none", isActive && "drop-shadow-[0_0_6px_hsl(152,69%,53%)]")} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}