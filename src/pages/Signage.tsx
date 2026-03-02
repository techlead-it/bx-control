import { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  FileImage, 
  Play, 
  Clock, 
  CheckCircle, 
  FileEdit, 
  Pause,
  ChevronRight,
  Video,
  Image,
  Type,
  Target,
  Filter
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { schedules, contents, getContentById, categoryLabels } from '@/lib/dummyData';

const statusLabels: Record<string, string> = {
  draft: '下書き',
  pending: '承認待ち',
  approved: '承認済み',
  running: '配信中',
  paused: '一時停止',
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileEdit className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  running: <Play className="h-4 w-4" />,
  paused: <Pause className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning border border-warning/20',
  approved: 'bg-primary/10 text-primary border border-primary/20',
  running: 'bg-success/10 text-success border border-success/20',
  paused: 'bg-muted text-muted-foreground',
};

const ruleLabels: Record<string, string> = {
  fixed: '固定',
  rotation: 'ローテーション',
  priority: '優先度順',
};

const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export default function Signage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const filteredSchedules = statusFilter === 'all' 
    ? schedules 
    : schedules.filter(s => s.status === statusFilter);

  const filteredContents = contents.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  const groupedSchedules = {
    running: schedules.filter(s => s.status === 'running'),
    pending: schedules.filter(s => s.status === 'pending'),
    approved: schedules.filter(s => s.status === 'approved'),
    draft: schedules.filter(s => s.status === 'draft'),
    paused: schedules.filter(s => s.status === 'paused'),
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="app-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">サイネージ運用</h1>
              <p className="text-sm text-muted-foreground mt-1">配信計画・コンテンツ管理</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="mr-2 h-4 w-4" />
                  新規スケジュール
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle>新規配信スケジュール作成</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>スケジュール名</Label>
                    <Input placeholder="例: 全国 住宅ローンキャンペーン" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>配信対象</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border border-border shadow-lg z-50">
                        <SelectItem value="all">全国</SelectItem>
                        <SelectItem value="region">地域指定</SelectItem>
                        <SelectItem value="branch">店舗指定</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>配信時間帯</Label>
                    <div className="flex gap-2 items-center">
                      <Input type="time" defaultValue="09:00" className="flex-1 rounded-xl" />
                      <span className="text-muted-foreground">〜</span>
                      <Input type="time" defaultValue="17:00" className="flex-1 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>配信曜日</Label>
                    <div className="flex gap-2">
                      {dayLabels.map((day, i) => (
                        <Button
                          key={i}
                          variant={i >= 1 && i <= 5 ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10 p-0 rounded-xl"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ルール</Label>
                    <Select defaultValue="rotation">
                      <SelectTrigger className="rounded-xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-popover border border-border shadow-lg z-50">
                        <SelectItem value="fixed">固定（1コンテンツのみ）</SelectItem>
                        <SelectItem value="rotation">ローテーション</SelectItem>
                        <SelectItem value="priority">優先度順</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">キャンセル</Button>
                  </DialogClose>
                  <Button className="rounded-full">作成</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tab Navigation - Pill Style */}
        <Tabs defaultValue="schedules" className="space-y-4">
          <TabsList className="w-full h-auto p-1 bg-muted/60 rounded-2xl grid grid-cols-2 gap-1">
            <TabsTrigger 
              value="schedules"
              className="rounded-xl py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              配信スケジュール
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="rounded-xl py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <FileImage className="h-4 w-4" />
              コンテンツ管理
            </TabsTrigger>
          </TabsList>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4 mt-4">
            {/* Status Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setStatusFilter('all')}
                className={`filter-chip whitespace-nowrap ${
                  statusFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                すべて
                <Badge variant="secondary" className="ml-2 rounded-full bg-background/20 text-inherit">
                  {schedules.length}
                </Badge>
              </button>
              {Object.entries(groupedSchedules).map(([status, items]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                  className={`filter-chip whitespace-nowrap flex items-center gap-2 ${
                    statusFilter === status 
                      ? statusColors[status]
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {statusIcons[status]}
                  {statusLabels[status]}
                  <Badge variant="secondary" className="rounded-full bg-background/20 text-inherit">
                    {items.length}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Schedule Cards */}
            <div className="space-y-3">
              {filteredSchedules.map((schedule, index) => (
                <div 
                  key={schedule.id} 
                  className="app-card p-4 hover:shadow-md transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      schedule.status === 'running' ? 'bg-success/10' :
                      schedule.status === 'pending' ? 'bg-warning/10' :
                      schedule.status === 'approved' ? 'bg-primary/10' :
                      'bg-muted'
                    }`}>
                      <span className={
                        schedule.status === 'running' ? 'text-success' :
                        schedule.status === 'pending' ? 'text-warning' :
                        schedule.status === 'approved' ? 'text-primary' :
                        'text-muted-foreground'
                      }>
                        {statusIcons[schedule.status]}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{schedule.name}</h3>
                        <Badge className={`rounded-full text-xs ${statusColors[schedule.status]}`}>
                          {statusLabels[schedule.status]}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          {schedule.branchScope === 'all' ? '全国' :
                           schedule.branchScope === 'region' ? schedule.region :
                           `${schedule.branchIds.length}店舗`}
                        </span>
                        <span>•</span>
                        <span>{schedule.timeRange}</span>
                        <span>•</span>
                        <span>{schedule.daysOfWeek.map(d => dayLabels[d]).join('')}</span>
                      </div>

                      {/* Content Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge variant="outline" className="rounded-full text-xs">
                          {ruleLabels[schedule.ruleType]}
                        </Badge>
                        {schedule.contentIds.slice(0, 2).map(cid => {
                          const content = getContentById(cid);
                          return content ? (
                            <Badge key={cid} variant="secondary" className="rounded-full text-xs">
                              {content.title.slice(0, 10)}...
                            </Badge>
                          ) : null;
                        })}
                        {schedule.contentIds.length > 2 && (
                          <Badge variant="secondary" className="rounded-full text-xs bg-muted">
                            +{schedule.contentIds.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {filteredSchedules.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">該当するスケジュールがありません</p>
              </div>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Filter Bar */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                絞り込み
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36 rounded-full bg-background">
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="mortgage">住宅ローン</SelectItem>
                  <SelectItem value="asset_management">資産運用</SelectItem>
                  <SelectItem value="account">口座開設</SelectItem>
                  <SelectItem value="campaign">キャンペーン</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-28 rounded-full bg-background">
                  <SelectValue placeholder="タイプ" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="video">動画</SelectItem>
                  <SelectItem value="image">画像</SelectItem>
                  <SelectItem value="text">テキスト</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContents.map((content, index) => (
                <div 
                  key={content.id} 
                  className="app-card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                    <div className="w-16 h-16 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center">
                      {content.type === 'video' ? (
                        <Video className="h-8 w-8 text-muted-foreground" />
                      ) : content.type === 'image' ? (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <Type className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs">
                      {content.defaultDurationSec}秒
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-2">{content.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {categoryLabels[content.category]}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-xs flex items-center gap-1">
                        {getTypeIcon(content.type)}
                        {content.type === 'video' ? '動画' : content.type === 'image' ? '画像' : 'テキスト'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      ターゲット: {content.targetSegment}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredContents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">該当するコンテンツがありません</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
