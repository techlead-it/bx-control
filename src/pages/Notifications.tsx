import { useState } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Info, CheckCircle2, Megaphone, Monitor, BarChart3, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  notifications, 
  currentUser, 
  notificationTypeLabels, 
  notificationCategoryLabels,
  getBranchById,
  type Notification,
  type NotificationType,
  type NotificationCategory
} from '@/lib/dummyData';
import { cn } from '@/lib/utils';

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  system: <Monitor className="h-4 w-4" />,
  schedule: <Calendar className="h-4 w-4" />,
  kpi: <BarChart3 className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  info: 'bg-primary/10 text-primary border-primary/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
  success: 'bg-success/10 text-success border-success/20',
};

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  urgent: <AlertTriangle className="h-5 w-5" />,
  success: <CheckCircle2 className="h-5 w-5" />,
};

export default function Notifications() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const filteredNotifications = localNotifications.filter(n => {
    if (filter === 'unread') {
      return !n.readByUserIds.includes(currentUser.id) && !n.isRead;
    }
    return true;
  });

  const unreadCount = localNotifications.filter(
    n => !n.readByUserIds.includes(currentUser.id) && !n.isRead
  ).length;

  const markAsRead = (notificationId: string) => {
    setLocalNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, readByUserIds: [...n.readByUserIds, currentUser.id] }
          : n
      )
    );
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(n => ({ ...n, readByUserIds: [...n.readByUserIds, currentUser.id] }))
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  return (
    <AppLayout title="通知" subtitle={`${unreadCount}件の未読`}>
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'filter-chip',
                filter === 'all' && 'filter-chip-active'
              )}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'filter-chip',
                filter === 'unread' && 'filter-chip-active'
              )}
            >
              未読
              {unreadCount > 0 && (
                <Badge className="ml-1.5 h-5 min-w-5 justify-center bg-destructive text-destructive-foreground">
                  {unreadCount}
                </Badge>
              )}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-primary"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              すべて既読
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => {
            const isRead = notification.readByUserIds.includes(currentUser.id) || notification.isRead;
            const targetBranches = notification.targetBranchIds?.map(id => getBranchById(id)).filter(Boolean);
            
            return (
              <div
                key={notification.id}
                onClick={() => !isRead && markAsRead(notification.id)}
                className={cn(
                  'app-card p-4 cursor-pointer transition-all animate-fade-in',
                  !isRead && 'border-l-4',
                  !isRead && notification.type === 'urgent' && 'border-l-destructive bg-destructive/5',
                  !isRead && notification.type === 'warning' && 'border-l-warning bg-warning/5',
                  !isRead && notification.type === 'success' && 'border-l-success bg-success/5',
                  !isRead && notification.type === 'info' && 'border-l-primary bg-primary/5',
                  isRead && 'opacity-70 hover:opacity-100'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  {/* Type Icon */}
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                    typeColors[notification.type]
                  )}>
                    {typeIcons[notification.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn(
                        'font-semibold text-foreground',
                        !isRead && 'font-bold'
                      )}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1">
                        {categoryIcons[notification.category]}
                        {notificationCategoryLabels[notification.category]}
                      </Badge>
                      
                      {targetBranches && targetBranches.length > 0 && (
                        <Badge variant="outline">
                          {targetBranches.map(b => b?.name).join(', ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Read Button */}
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotifications.length === 0 && (
            <div className="empty-state py-16">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? '未読の通知はありません' : '通知はありません'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
