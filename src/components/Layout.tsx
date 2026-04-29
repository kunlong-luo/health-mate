import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, History, Settings, HeartPulse, Users, LogOut, LogIn, Activity, Pill, Bell } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import ChatDrawer from "./ChatDrawer";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { t } = useTranslation();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      if (!token) return 0;
      try {
        const res = await fetch('/api/notifications/unread-count', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return 0;
        const data = await res.json();
        return data?.count ?? 0;
      } catch (err) {
        return 0;
      }
    },
    enabled: !!token,
    refetchInterval: 60000 // poll every minute
  });

  const navItems = [
    { name: t('nav.home'), path: "/", icon: Home },
    { name: t('nav.family'), path: "/family", icon: Users },
    { name: t('nav.history'), path: "/history", icon: History },
    { name: t('nav.visits'), path: "/visits", icon: Activity },
    { name: t('nav.medications'), path: "/medications", icon: Pill },
    { name: t('nav.notifications'), path: "/notifications", icon: Bell, badge: unreadCount },
    { name: t('nav.settings'), path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isVisitActive = location.pathname.includes('/active');

  return (
    <div className={clsx("min-h-screen text-stone-900 pb-20 md:pb-0 font-sans", isVisitActive ? "bg-stone-900" : "bg-[#fdfdfa]")}>
      {!isVisitActive && (
        <header className="bg-[#fdfdfa]/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-10 transition-all">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#5a5a35] flex items-center justify-center text-[#fdfdfa] shadow-sm group-hover:bg-[#4a4a2e] transition">
                <HeartPulse size={16} />
              </div>
              <span className="font-serif text-xl font-medium tracking-tight text-[#292524]">HealthMate</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#5A5A40] relative",
                      isActive ? "text-[#5A5A40]" : "text-stone-400"
                    )}
                  >
                    <Icon size={16} />
                    {item.name}
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              
              <div className="h-6 w-px bg-stone-200 mx-1"></div>
              
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-medium text-stone-400 hover:text-red-500 transition-colors">
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-[#5A5A40] hover:text-[#4A4A30] transition-colors">
                  <LogIn size={16} /> {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={clsx("max-w-4xl mx-auto px-4", !isVisitActive && "py-8")}>{children}</main>

      {/* Mobile nav */}
      {!isVisitActive && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center h-16 px-1 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors flex-shrink-0 relative",
                  isActive ? "text-[#5A5A40]" : "text-stone-400"
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && item.badge > 0 ? (
                     <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border border-white"></span>
                  ) : null}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Global generic chat drawer */}
      {user && !isVisitActive && <ChatDrawer />}
    </div>
  );
}
