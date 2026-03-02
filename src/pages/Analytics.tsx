import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Target, Zap, RefreshCw, Download, Calendar, Building2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  schedules, kpiDaily, branches, getContentById, categoryLabels, getBranchById,
  getKpiTargetByBranchAndMonth, kpiTargets, customerReactions, reactionTypeLabels
} from '@/lib/dummyData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ScatterChart, Scatter, ComposedChart, Line } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const regions = ['すべて', '関東', '関西', '中部', '九州', '北海道', '東北', '中国'];
const categories = ['すべて', 'mortgage', 'asset_management', 'account', 'campaign'];

export default function Analytics() {
  const [periodFilter, setPeriodFilter] = useState('30');
  const [regionFilter, setRegionFilter] = useState('すべて');
  const [categoryFilter, setCategoryFilter] = useState('すべて');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      toast.success('データを更新しました');
    }, 1000);
  };

  // Auto-refresh simulation (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate schedule effectiveness (mock)
  const scheduleEffectiveness = schedules
    .filter(s => s.status === 'running' || s.status === 'approved')
    .map(schedule => {
      const affectedBranches = schedule.branchScope === 'all' 
        ? branches 
        : schedule.branchScope === 'region'
        ? branches.filter(b => b.region === schedule.region)
        : branches.filter(b => schedule.branchIds.includes(b.id));

      const branchIds = affectedBranches.map(b => b.id);
      const relevantKpi = kpiDaily.filter(k => branchIds.includes(k.branchId));
      
      const beforeKpi = relevantKpi.slice(0, Math.floor(relevantKpi.length / 2));
      const afterKpi = relevantKpi.slice(Math.floor(relevantKpi.length / 2));
      
      const beforeConsult = beforeKpi.reduce((s, k) => s + k.consultCount, 0);
      const afterConsult = afterKpi.reduce((s, k) => s + k.consultCount, 0);
      const beforeSfa = beforeKpi.reduce((s, k) => s + k.sfaCreatedCount, 0);
      const afterSfa = afterKpi.reduce((s, k) => s + k.sfaCreatedCount, 0);
      
      const consultChange = beforeConsult > 0 ? Math.round(((afterConsult - beforeConsult) / beforeConsult) * 100) : 0;
      const sfaChange = beforeSfa > 0 ? Math.round(((afterSfa - beforeSfa) / beforeSfa) * 100) : 0;

      const mainContent = getContentById(schedule.contentIds[0]);
      
      return {
        schedule,
        beforeConsult,
        afterConsult,
        consultChange,
        beforeSfa,
        afterSfa,
        sfaChange,
        category: mainContent?.category || 'campaign',
      };
    })
    .sort((a, b) => b.consultChange - a.consultChange);

  // Filter by category
  const filteredEffectiveness = categoryFilter === 'すべて'
    ? scheduleEffectiveness
    : scheduleEffectiveness.filter(e => e.category === categoryFilter);

  // Prepare chart data for comparison
  const comparisonData = filteredEffectiveness.slice(0, 5).map(e => ({
    name: e.schedule.name.slice(0, 12) + '...',
    変更前: e.beforeConsult,
    変更後: e.afterConsult,
    変化率: e.consultChange,
  }));

  // Scatter data for correlation
  const correlationData = branches.map(branch => {
    const branchKpi = kpiDaily.filter(k => k.branchId === branch.id);
    const totalImpressions = branchKpi.reduce((s, k) => s + k.signageImpressions, 0);
    const totalConsult = branchKpi.reduce((s, k) => s + k.consultCount, 0);
    return {
      x: totalImpressions,
      y: totalConsult,
      name: branch.name,
    };
  });

  // Branch ranking by effectiveness
  const branchRanking = branches
    .filter(b => regionFilter === 'すべて' || b.region === regionFilter)
    .map(branch => {
      const branchKpi = kpiDaily.filter(k => k.branchId === branch.id).slice(-parseInt(periodFilter));
      const previousKpi = kpiDaily.filter(k => k.branchId === branch.id).slice(-parseInt(periodFilter) * 2, -parseInt(periodFilter));
      
      const currentConsult = branchKpi.reduce((s, k) => s + k.consultCount, 0);
      const previousConsult = previousKpi.reduce((s, k) => s + k.consultCount, 0);
      const change = previousConsult > 0 ? Math.round(((currentConsult - previousConsult) / previousConsult) * 100) : 0;
      
      // Get target achievement
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const target = getKpiTargetByBranchAndMonth(branch.id, currentMonth);
      const monthlyKpi = branchKpi.filter(k => {
        const kpiMonth = `${k.date.getFullYear()}-${String(k.date.getMonth() + 1).padStart(2, '0')}`;
        return kpiMonth === currentMonth;
      });
      const monthlyConsult = monthlyKpi.reduce((s, k) => s + k.consultCount, 0);
      const targetProgress = target ? Math.round((monthlyConsult / target.targetConsult) * 100) : 0;
      
      return {
        branch,
        currentConsult,
        change,
        targetProgress,
      };
    }).sort((a, b) => b.change - a.change);

  // Trend data for line chart
  const trendData = Array.from({ length: parseInt(periodFilter) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (parseInt(periodFilter) - 1 - i));
    const dayKpi = kpiDaily.filter(k => {
      const kpiDate = new Date(k.date);
      return kpiDate.getDate() === date.getDate() && 
             kpiDate.getMonth() === date.getMonth() &&
             kpiDate.getFullYear() === date.getFullYear();
    }).filter(k => regionFilter === 'すべて' || getBranchById(k.branchId)?.region === regionFilter);

    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      相談: dayKpi.reduce((s, k) => s + k.consultCount, 0),
      提案: dayKpi.reduce((s, k) => s + k.proposalCount, 0),
      成約: dayKpi.reduce((s, k) => s + k.contractCount, 0),
    };
  });

  // Reaction stats by content
  const reactionsByContent = customerReactions.reduce((acc, r) => {
    const content = getContentById(r.contentId);
    if (!content) return acc;
    if (!acc[r.contentId]) {
      acc[r.contentId] = { title: content.title, category: content.category, positive: 0, negative: 0, total: 0 };
    }
    acc[r.contentId].total++;
    if (r.reactionType === 'positive' || r.reactionType === 'interested') {
      acc[r.contentId].positive++;
    } else if (r.reactionType === 'negative') {
      acc[r.contentId].negative++;
    }
    return acc;
  }, {} as Record<string, { title: string; category: string; positive: number; negative: number; total: number }>);

  const topReactedContent = Object.entries(reactionsByContent)
    .map(([id, data]) => ({ id, ...data, positiveRate: Math.round((data.positive / data.total) * 100) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const handleExport = () => {
    toast.success('レポートをエクスポートしました');
  };

  return (
    <AppLayout title="効果分析" subtitle="サイネージ施策の効果を可視化">
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn('h-4 w-4 mr-1', isRefreshing && 'animate-spin')} />
                更新
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                エクスポート
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7日間</SelectItem>
              <SelectItem value="14">14日間</SelectItem>
              <SelectItem value="30">30日間</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="すべて">すべてのカテゴリ</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trend Chart */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              KPI推移トレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProposal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="相談" stroke="hsl(var(--chart-1))" fill="url(#colorConsult)" strokeWidth={2} />
                  <Area type="monotone" dataKey="提案" stroke="hsl(var(--chart-2))" fill="url(#colorProposal)" strokeWidth={2} />
                  <Area type="monotone" dataKey="成約" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Schedule Effectiveness Comparison */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                配信スケジュール別 効果比較
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="変更前" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="変更後" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Content by Reactions */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                お客様反応ランキング
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReactedContent.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[item.category as keyof typeof categoryLabels]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.total}件の反応</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold',
                        item.positiveRate >= 60 ? 'text-success' : item.positiveRate >= 40 ? 'text-warning' : 'text-destructive'
                      )}>
                        {item.positiveRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">好反応率</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Branch Target Achievement */}
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                店舗別 目標達成状況
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {branchRanking.slice(0, 8).map((item, index) => (
                  <div
                    key={item.branch.id}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      item.targetProgress >= 100 ? 'border-success/30 bg-success/5' :
                      item.targetProgress >= 70 ? 'border-warning/30 bg-warning/5' :
                      'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        index < 3 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </span>
                      <div className={cn(
                        'flex items-center gap-1 text-sm font-semibold',
                        item.change >= 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
                    </div>
                    <p className="font-medium truncate mb-1">{item.branch.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{item.branch.region}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">目標達成率</span>
                        <span className="font-medium">{Math.min(item.targetProgress, 100)}%</span>
                      </div>
                      <Progress value={Math.min(item.targetProgress, 100)} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Correlation Chart */}
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">サイネージ配信量 vs 相談数（相関分析）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" dataKey="x" name="配信量" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="number" dataKey="y" name="相談数" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                      formatter={(value, name) => [value, name === 'x' ? '配信量' : '相談数']}
                    />
                    <Scatter data={correlationData} fill="hsl(var(--chart-2))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-medium mb-1">💡 インサイト</p>
                <p className="text-xs text-muted-foreground">
                  配信量と相談数に正の相関が見られます。特に大型店舗で効果が高い傾向です。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
