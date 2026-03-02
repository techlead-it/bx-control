import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Monitor, 
  WifiOff, 
  Play, 
  RefreshCw, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Users,
  Target,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getBranchById,
  getDevicesByBranchId,
  getLeadsByBranchId,
  getKpiByBranchId,
  getSchedulesByBranchId,
  contents,
  getContentById,
  stageLabels,
  topicLabels,
  sourceLabels,
  categoryLabels,
} from '@/lib/dummyData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export default function BranchDetail() {
  const { id } = useParams<{ id: string }>();
  const branch = getBranchById(id || '');
  const [selectedContent, setSelectedContent] = useState<string>('');
  
  if (!branch) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">店舗が見つかりません</p>
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/branches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              店舗一覧に戻る
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const devices = getDevicesByBranchId(branch.id);
  const leads = getLeadsByBranchId(branch.id);
  const kpiData = getKpiByBranchId(branch.id);
  const schedules = getSchedulesByBranchId(branch.id);
  
  // Prepare chart data - last 7 days
  const chartData = kpiData.slice(-7).map(k => ({
    date: new Date(k.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
    相談: k.consultCount,
    提案: k.proposalCount,
    成約: k.contractCount,
  }));

  // Calculate 7-day and 30-day totals
  const last7Days = kpiData.slice(-7);
  const last30Days = kpiData.slice(-30);
  
  const sum7 = {
    consult: last7Days.reduce((s, k) => s + k.consultCount, 0),
    proposal: last7Days.reduce((s, k) => s + k.proposalCount, 0),
    contract: last7Days.reduce((s, k) => s + k.contractCount, 0),
  };
  
  const sum30 = {
    consult: last30Days.reduce((s, k) => s + k.consultCount, 0),
    proposal: last30Days.reduce((s, k) => s + k.proposalCount, 0),
    contract: last30Days.reduce((s, k) => s + k.contractCount, 0),
  };

  // Effect comparison (mock)
  const beforeChange = kpiData.slice(-14, -7);
  const afterChange = kpiData.slice(-7);
  const beforeConsult = beforeChange.reduce((s, k) => s + k.consultCount, 0);
  const afterConsult = afterChange.reduce((s, k) => s + k.consultCount, 0);
  const consultChange = beforeConsult > 0 ? Math.round(((afterConsult - beforeConsult) / beforeConsult) * 100) : 0;

  const locationLabels: Record<string, string> = {
    entrance: '入口',
    waiting: '待合',
    counter: '窓口横',
  };

  const runningSchedules = schedules.filter(s => s.status === 'running');
  const onlineDevices = devices.filter(d => d.status === 'online').length;

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header Card */}
        <div className="app-card p-6">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
              <Link to="/branches">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{branch.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{branch.region} ・ {branch.address}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                <Monitor className="h-5 w-5" />
                <span>{onlineDevices}/{devices.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">端末稼働</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                <Target className="h-5 w-5" />
                <span>{sum7.consult}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">今週相談</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                <Sparkles className="h-5 w-5" />
                <span>{sum7.contract}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">今週成約</p>
            </div>
          </div>

          {/* Segment Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {branch.targetSegments.map(seg => (
              <Badge key={seg} variant="secondary" className="rounded-full px-3">{seg}</Badge>
            ))}
          </div>
        </div>

        {/* Tab Navigation - Pill Style */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full h-auto p-1 bg-muted/60 rounded-2xl grid grid-cols-4 gap-1">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              概要
            </TabsTrigger>
            <TabsTrigger 
              value="signage"
              className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              サイネージ
            </TabsTrigger>
            <TabsTrigger 
              value="sfa"
              className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              SFA
            </TabsTrigger>
            <TabsTrigger 
              value="effect"
              className="rounded-xl py-2.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              効果
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Period KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* 7 Days Card */}
              <div className="app-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">直近7日間</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{sum7.consult}</p>
                    <p className="text-xs text-muted-foreground mt-1">相談</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{sum7.proposal}</p>
                    <p className="text-xs text-muted-foreground mt-1">提案</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{sum7.contract}</p>
                    <p className="text-xs text-muted-foreground mt-1">成約</p>
                  </div>
                </div>
              </div>

              {/* Conversion Rate Card */}
              <div className="app-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="font-medium">転換率</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-3xl font-bold text-primary">
                      {sum7.consult > 0 ? Math.round((sum7.proposal / sum7.consult) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">相談→提案</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-3xl font-bold text-primary">
                      {sum7.proposal > 0 ? Math.round((sum7.contract / sum7.proposal) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">提案→成約</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 30 Days Summary */}
            <div className="app-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Clock className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="font-medium">直近30日間サマリー</span>
              </div>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold">{sum30.consult}</p>
                  <p className="text-xs text-muted-foreground">相談</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{sum30.proposal}</p>
                  <p className="text-xs text-muted-foreground">提案</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold">{sum30.contract}</p>
                  <p className="text-xs text-muted-foreground">成約</p>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="app-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">KPI推移（7日間）</h3>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '16px' }}
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                    <Area type="monotone" dataKey="相談" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#colorConsult)" />
                    <Area type="monotone" dataKey="提案" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#colorProposal)" />
                    <Line type="monotone" dataKey="成約" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Signage Tab */}
          <TabsContent value="signage" className="space-y-4 mt-4">
            {/* Device Status */}
            <div className="app-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">サイネージ端末</span>
                </div>
                <Badge className="rounded-full bg-muted text-foreground">
                  {onlineDevices}/{devices.length} オンライン
                </Badge>
              </div>
              
              <div className="space-y-3">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className={`flex items-center gap-4 rounded-xl p-4 transition-all ${
                      device.status === 'online' 
                        ? 'bg-success/5 border border-success/20' 
                        : 'bg-destructive/5 border border-destructive/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      device.status === 'online' ? 'bg-success/10' : 'bg-destructive/10'
                    }`}>
                      {device.status === 'online' ? (
                        <Monitor className="h-5 w-5 text-success" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{locationLabels[device.locationInBranch]}</p>
                      <p className="text-xs text-muted-foreground">
                        最終応答: {new Date(device.lastHeartbeatAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <Badge className={`rounded-full ${
                      device.status === 'online' 
                        ? 'bg-success/10 text-success border-0' 
                        : 'bg-destructive/10 text-destructive border-0'
                    }`}>
                      {device.status === 'online' ? 'オンライン' : 'オフライン'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Schedules */}
            <div className="app-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Play className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="font-medium">配信中のスケジュール</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="rounded-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      一時差し替え
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>コンテンツ一時差し替え</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        この店舗のみ、本日の配信コンテンツを一時的に変更します。
                      </p>
                      <Select value={selectedContent} onValueChange={setSelectedContent}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="差し替えるコンテンツを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {contents.map(content => (
                            <SelectItem key={content.id} value={content.id}>
                              {content.title} ({categoryLabels[content.category]})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="rounded-full">キャンセル</Button>
                      </DialogClose>
                      <Button disabled={!selectedContent} className="rounded-full">差し替え実行</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {runningSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">現在配信中のスケジュールはありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runningSchedules.map(schedule => (
                    <div key={schedule.id} className="flex items-center gap-4 rounded-xl border border-border/60 p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <Play className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{schedule.name}</p>
                        <p className="text-xs text-muted-foreground">{schedule.timeRange}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {schedule.contentIds.slice(0, 2).map(cid => {
                          const content = getContentById(cid);
                          return content ? (
                            <Badge key={cid} variant="secondary" className="text-xs rounded-full">
                              {content.title.slice(0, 8)}...
                            </Badge>
                          ) : null;
                        })}
                        {schedule.contentIds.length > 2 && (
                          <Badge variant="outline" className="text-xs rounded-full">+{schedule.contentIds.length - 2}</Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* SFA Tab */}
          <TabsContent value="sfa" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{leads.length}件の案件</span>
              </div>
              <Button asChild className="rounded-full">
                <Link to={`/sfa/new?branch_id=${branch.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  30秒起票
                </Link>
              </Button>
            </div>

            {/* Lead Cards - Mobile Friendly */}
            <div className="space-y-3">
              {leads.slice(0, 10).map((lead, index) => (
                <div 
                  key={lead.id} 
                  className="app-card p-4 hover:shadow-md transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`rounded-full text-xs stage-${
                          lead.stage === 'consult' ? 'consult' : 
                          lead.stage === 'proposal' ? 'proposal' : 
                          lead.stage === 'contract' ? 'contract' : 
                          lead.stage === 'application' ? 'application' : 'lost'
                        }`}>
                          {stageLabels[lead.stage]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {lead.customerType === 'new' ? '新規' : '既存'}
                        </span>
                      </div>
                      <p className="font-medium">{topicLabels[lead.topic]}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{sourceLabels[lead.source]}</span>
                        <span>•</span>
                        <span>{new Date(lead.createdAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            
            {leads.length > 10 && (
              <Button variant="outline" className="w-full rounded-full">
                すべての案件を見る ({leads.length}件)
              </Button>
            )}
          </TabsContent>

          {/* Effect Tab */}
          <TabsContent value="effect" className="space-y-4 mt-4">
            <div className="app-card p-5">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">サイネージ変更前後の比較</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">変更前7日間</p>
                  <p className="text-3xl font-bold">{beforeConsult}</p>
                  <p className="text-xs text-muted-foreground mt-1">相談数</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">変更後7日間</p>
                  <p className="text-3xl font-bold">{afterConsult}</p>
                  <p className="text-xs text-muted-foreground mt-1">相談数</p>
                </div>
                <div className={`text-center p-4 rounded-xl ${
                  consultChange >= 0 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  <p className="text-xs text-muted-foreground mb-2">変化率</p>
                  <div className="flex items-center justify-center gap-1">
                    {consultChange >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`text-3xl font-bold ${
                      consultChange >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {consultChange > 0 ? '+' : ''}{consultChange}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Card */}
            <div className="app-card p-5 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">インサイト</h4>
                  <p className="text-sm text-muted-foreground">
                    {consultChange >= 0 
                      ? `サイネージ変更後、相談数が${consultChange}%増加しました。現在のコンテンツ配信は効果的です。`
                      : `サイネージ変更後、相談数が${Math.abs(consultChange)}%減少しています。コンテンツの見直しを検討してください。`
                    }
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
