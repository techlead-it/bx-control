import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Monitor,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Plus,
  Search,
  CheckCircle,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentUser, roleLabels, getUnreadNotificationCount, getPendingApprovals } from '@/lib/dummyData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'ホーム', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard' },
  { label: '店舗', icon: <Building2 className="h-5 w-5" />, href: '/branches' },
  { label: 'サイネージ', icon: <Monitor className="h-5 w-5" />, href: '/signage', badge: 1 },
  { label: 'SFA', icon: <FileText className="h-5 w-5" />, href: '/sfa' },
  { label: '分析', icon: <BarChart3 className="h-5 w-5" />, href: '/analytics' },
];

const secondaryNavItems: NavItem[] = [
  { label: '承認', icon: <CheckCircle className="h-5 w-5" />, href: '/approvals', badge: getPendingApprovals().length },
  { label: '反応メモ', icon: <MessageSquare className="h-5 w-5" />, href: '/reactions' },
  { label: 'カレンダー', icon: <Calendar className="h-5 w-5" />, href: '/signage/calendar' },
];

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-72 flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/20">
            <span className="text-lg font-bold">BX</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">BX Control</h1>
            <p className="text-xs text-muted-foreground">店舗改革プラットフォーム</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn('nav-item', isActive && 'nav-item-active')}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && !isActive && (
                  <Badge className="h-5 min-w-5 justify-center px-1.5 bg-destructive text-destructive-foreground">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <p className="text-xs font-medium text-muted-foreground px-3 mb-2">ツール</p>
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn('nav-item', isActive && 'nav-item-active')}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && !isActive && (
                    <Badge className="h-5 min-w-5 justify-center px-1.5 bg-warning text-warning-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <Link
              to="/notifications"
              className={cn('nav-item', location.pathname === '/notifications' && 'nav-item-active')}
            >
              <Bell className="h-5 w-5" />
              <span className="flex-1">通知</span>
              {getUnreadNotificationCount(currentUser.id) > 0 && (
                <Badge className="h-5 min-w-5 justify-center px-1.5 bg-destructive text-destructive-foreground">
                  {getUnreadNotificationCount(currentUser.id)}
                </Badge>
              )}
            </Link>
            <Link
              to="/admin"
              className={cn('nav-item', location.pathname === '/admin' && 'nav-item-active')}
            >
              <Settings className="h-5 w-5" />
              <span>設定</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <div className="avatar h-10 w-10 text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[currentUser.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden floating-header">
        <div className="flex items-center justify-between h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="icon-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white">
              <span className="text-sm font-bold">BX</span>
            </div>
            <span className="font-semibold">BX Control</span>
          </div>

          <Link to="/notifications" className="icon-btn relative">
            <Bell className="h-5 w-5" />
            {getUnreadNotificationCount(currentUser.id) > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 bg-sidebar p-4 animate-slide-in-right shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white">
                  <span className="font-bold">BX</span>
                </div>
                <span className="font-bold text-lg">BX Control</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn('nav-item', isActive && 'nav-item-active')}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-2">ツール</p>
                {secondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn('nav-item', isActive && 'nav-item-active')}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="h-5 min-w-5 justify-center px-1.5 bg-warning text-warning-foreground">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <Link
                  to="/notifications"
                  onClick={() => setSidebarOpen(false)}
                  className={cn('nav-item', location.pathname === '/notifications' && 'nav-item-active')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="flex-1">通知</span>
                  {getUnreadNotificationCount(currentUser.id) > 0 && (
                    <Badge className="h-5 min-w-5 justify-center px-1.5 bg-destructive text-destructive-foreground">
                      {getUnreadNotificationCount(currentUser.id)}
                    </Badge>
                  )}
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={cn('nav-item', location.pathname === '/admin' && 'nav-item-active')}
                >
                  <Settings className="h-5 w-5" />
                  <span>設定</span>
                </Link>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Desktop Header */}
        <header className="hidden lg:block floating-header">
          <div className="flex items-center justify-between h-20 px-8">
            <div>
              {title && <h1 className="text-xl font-bold">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="search-bar w-64">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="検索..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Link to="/notifications" className="icon-btn relative">
                <Bell className="h-5 w-5" />
                {getUnreadNotificationCount(currentUser.id) > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Link>
              <div className="avatar h-10 w-10 text-sm cursor-pointer">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn('bottom-nav-item', isActive && 'bottom-nav-item-active')}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB */}
      <Link to="/sfa/new" className="fab">
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
