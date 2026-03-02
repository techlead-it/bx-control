import { useState, useEffect } from 'react';
import { MessageSquare, FileText, CheckCircle, PlusCircle, TrendingUp, TrendingDown, ArrowRight, Zap, Bell, Target, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  branches, getKpiSummary, kpiDaily, signageDevices, getBranchById, schedules,
  getUnreadNotificationCount, currentUser, getPendingApprovals, getKpiTargetByBranchAndMonth
} from '@/lib/dummyData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type DateRange = 'today' | 'week' | 'month';

const dateRangeLabels: Record<DateRange, string> = {
  today: '今日',
  week: '今週',
  month: '今月',
};

const dateRangeDays: Record<DateRange, number> = {
  today: 1,
  week: 7,
  month: 30,
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const summary = getKpiSummary(dateRangeDays[dateRange]);
  const previousSummary = getKpiSummary(dateRangeDays[dateRange] * 2);
  
  const calculateTrend = (current: number, previous: number) => {
    const prevValue = previous - current;
    if (prevValue === 0) return 0;
    return Math.round(((current - prevValue) / prevValue) * 100);
  };

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      toast.success('データを更新しました');
    }, 1000);
  };

  // Top performing branches
  const branchPerformance = branches.map(branch => {
    const branchKpi = kpiDaily.filter(k => k.branchId === branch.id);
    const recentKpi = branchKpi.slice(-dateRangeDays[dateRange]);
    const currentTotal = recentKpi.reduce((sum, k) => sum + k.consultCount, 0);
    
    // Get target
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const target = getKpiTargetByBranchAndMonth(branch.id, currentMonth);
    const monthlyKpi = branchKpi.filter(k => {
      const kpiMonth = `${k.date.getFullYear()}-${String(k.date.getMonth() + 1).padStart(2, '0')}`;
      return kpiMonth === currentMonth;
    });
    const monthlyConsult = monthlyKpi.reduce((s, k) => s + k.consultCount, 0);
    const targetProgress = target ? Math.round((monthlyConsult / target.targetConsult) * 100) : 0;
    
    return { branch, value: currentTotal, targetProgress };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  // Status counts
  const offlineDevices = signageDevices.filter(d => d.status === 'offline').length;
  const runningSchedules = schedules.filter(s => s.status === 'running').length;
  const pendingSchedules = schedules.filter(s => s.status === 'pending').length;
  const unreadNotifications = getUnreadNotificationCount(currentUser.id);
  const pendingApprovals = getPendingApprovals().length;

  const kpiCards = [
    { 
      label: '相談数', 
      value: summary.totalConsult, 
      trend: calculateTrend(summary.totalConsult, previousSummary.totalConsult),
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary'
    },
    { 
      label: '提案件数', 
      value: summary.totalProposal, 
      trend: calculateTrend(summary.totalProposal, previousSummary.totalProposal),
      icon: FileText,
      color: 'bg-accent/10 text-accent'
    },
    { 
      label: '成約数', 
      value: summary.totalContract, 
      trend: calculateTrend(summary.totalContract, previousSummary.totalContract),
      icon: CheckCircle,
      color: 'bg-success/10 text-success'
    },
    { 
      label: 'SFA起票', 
      value: summary.totalSfaCreated, 
      trend: calculateTrend(summary.totalSfaCreated, previousSummary.totalSfaCreated),
      icon: PlusCircle,
      color: 'bg-warning/10 text-warning'
    },
  ];

  return (
    <AppLayout title="ダッシュボード" subtitle="店舗パフォーマンス概要">
      <div className="space-y-6">
        {/* Real-time Header */}
        <div className="app-card p-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">リアルタイムダッシュボード</p>
                <p className="text-xs text-muted-foreground">
                  最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn('h-4 w-4 mr-1', isRefreshing && 'animate-spin')} />
                更新
              </Button>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-28 rounded-xl bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border">
                  {Object.entries(dateRangeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="rounded-lg">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Alert Badges */}
        {(unreadNotifications > 0 || pendingApprovals > 0) && (
          <div className="flex flex-wrap gap-2">
            {unreadNotifications > 0 && (
              <Link to="/notifications" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">{unreadNotifications}件の未読通知</span>
              </Link>
            )}
            {pendingApprovals > 0 && (
              <Link to="/approvals" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 text-warning hover:bg-warning/20 transition-colors">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{pendingApprovals}件の承認待ち</span>
              </Link>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, index) => (
            <div 
              key={card.label}
              className="kpi-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2.5 rounded-xl', card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  card.trend >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {card.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {card.trend > 0 ? '+' : ''}{card.trend}%
                </div>
              </div>
              <p className="kpi-value">{card.value}</p>
              <p className="kpi-label mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="app-card p-5">
          <h3 className="font-semibold text-foreground mb-4">クイックアクション</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link 
              to="/sfa/new"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              <div className="p-2 rounded-lg bg-white/20">
                <Zap className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-center">30秒起票</p>
            </Link>
            
            <Link 
              to="/reactions"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all group"
            >
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-center text-foreground">反応メモ</p>
            </Link>
            
            <Link 
              to="/signage/calendar"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all group"
            >
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <FileText className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-center text-foreground">カレンダー</p>
            </Link>
            
            <Link 
              to="/analytics"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all group"
            >
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Target className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-center text-foreground">効果分析</p>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Branches with Target Progress */}
          <div className="app-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">店舗ランキング</h3>
              <Link to="/branches" className="text-sm text-primary hover:underline">すべて見る</Link>
            </div>
            <div className="space-y-3">
              {branchPerformance.map((item, index) => (
                <Link 
                  key={item.branch.id}
                  to={`/branches/${item.branch.id}`}
                  className="list-item group"
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shrink-0',
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.branch.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={Math.min(item.targetProgress, 100)} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground shrink-0">{item.targetProgress}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{item.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">件</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Status Overview */}
          <div className="app-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">システム状況</h3>
              <Link to="/approvals" className="text-sm text-primary hover:underline">承認管理</Link>
            </div>
            <div className="space-y-3">
              <Link to="/signage" className="metric-card hover:bg-muted/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-success/10 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">配信中スケジュール</p>
                  <p className="text-xs text-muted-foreground">正常に稼働中</p>
                </div>
                <p className="text-2xl font-bold text-success">{runningSchedules}</p>
              </Link>
              
              <Link to="/approvals" className="metric-card hover:bg-muted/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">承認待ち</p>
                  <p className="text-xs text-muted-foreground">確認が必要</p>
                </div>
                <p className="text-2xl font-bold text-warning">{pendingSchedules}</p>
              </Link>
              
              <Link to="/notifications" className="metric-card hover:bg-muted/50 transition-colors">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">未読通知</p>
                  <p className="text-xs text-muted-foreground">新着情報</p>
                </div>
                <p className="text-2xl font-bold text-primary">{unreadNotifications}</p>
              </Link>
              
              <div className={cn(
                'metric-card',
                offlineDevices > 0 && 'bg-destructive/5'
              )}>
                <div className={cn(
                  'p-2.5 rounded-xl',
                  offlineDevices > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                )}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">オフライン端末</p>
                  <p className="text-xs text-muted-foreground">要対応</p>
                </div>
                <p className={cn(
                  'text-2xl font-bold',
                  offlineDevices > 0 ? 'text-destructive' : 'text-muted-foreground'
                )}>{offlineDevices}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
