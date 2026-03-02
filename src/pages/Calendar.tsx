import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Settings2,
  Filter,
  LayoutGrid,
  List,
  CalendarDays,
  Eye,
  EyeOff,
  Palette,
  RotateCcw,
  Download,
  Plus,
  X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { schedules, branches, getContentById, categoryLabels, contents } from '@/lib/dummyData';
import { cn } from '@/lib/utils';

const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
const daysOfWeekFull = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

type ViewMode = 'month' | 'week' | 'day';
type ColorScheme = 'status' | 'category' | 'branch';

interface DisplaySettings {
  showWeekends: boolean;
  showEmptyDays: boolean;
  compactMode: boolean;
  showTimeSlots: boolean;
  colorScheme: ColorScheme;
  highlightToday: boolean;
  showStatusBadges: boolean;
  maxEventsPerDay: number;
}

interface FilterSettings {
  statuses: string[];
  categories: string[];
  contentTypes: string[];
  regions: string[];
}

const statusColors: Record<string, string> = {
  running: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  approved: 'bg-primary text-primary-foreground',
  draft: 'bg-muted text-muted-foreground',
  paused: 'bg-destructive/20 text-destructive',
};

const categoryColors: Record<string, string> = {
  mortgage: 'bg-blue-500',
  asset_management: 'bg-purple-500',
  account: 'bg-green-500',
  campaign: 'bg-orange-500',
};

const statusLabels: Record<string, string> = {
  running: '配信中',
  pending: '承認待ち',
  approved: '承認済み',
  draft: '下書き',
  paused: '一時停止',
};

const defaultDisplaySettings: DisplaySettings = {
  showWeekends: true,
  showEmptyDays: true,
  compactMode: false,
  showTimeSlots: false,
  colorScheme: 'status',
  highlightToday: true,
  showStatusBadges: true,
  maxEventsPerDay: 5,
};

const defaultFilterSettings: FilterSettings = {
  statuses: ['running', 'pending', 'approved'],
  categories: [],
  contentTypes: [],
  regions: [],
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(defaultFilterSettings);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get calendar data based on view mode
  const calendarData = useMemo(() => {
    if (viewMode === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const startingDayOfWeek = firstDayOfMonth.getDay();
      const totalDays = lastDayOfMonth.getDate();

      const days: (Date | null)[] = [];
      
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      for (let day = 1; day <= totalDays; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      return days;
    } else {
      return [currentDate];
    }
  }, [currentDate, viewMode, year, month]);

  // Filter schedules based on settings
  const getSchedulesForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return schedules.filter(schedule => {
      if (!schedule.daysOfWeek.includes(dayOfWeek)) return false;
      
      // Status filter
      if (filterSettings.statuses.length > 0 && !filterSettings.statuses.includes(schedule.status)) {
        return false;
      }
      
      // Region filter
      if (filterSettings.regions.length > 0) {
        if (schedule.branchScope === 'region' && schedule.region && !filterSettings.regions.includes(schedule.region)) {
          return false;
        }
        if (schedule.branchScope === 'branch') {
          const hasMatchingBranch = schedule.branchIds.some(id => {
            const branch = branches.find(b => b.id === id);
            return branch && filterSettings.regions.includes(branch.region);
          });
          if (!hasMatchingBranch) return false;
        }
      }
      
      // Category filter
      if (filterSettings.categories.length > 0) {
        const contentCategories = schedule.contentIds.map(id => {
          const content = getContentById(id);
          return content?.category;
        }).filter(Boolean);
        
        if (!contentCategories.some(cat => cat && filterSettings.categories.includes(cat))) {
          return false;
        }
      }
      
      // Content type filter
      if (filterSettings.contentTypes.length > 0) {
        const contentTypes = schedule.contentIds.map(id => {
          const content = getContentById(id);
          return content?.type;
        }).filter(Boolean);
        
        if (!contentTypes.some(type => type && filterSettings.contentTypes.includes(type))) {
          return false;
        }
      }
      
      return true;
    });
  };

  const navigateCalendar = (direction: number) => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + direction, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction * 7));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + direction);
      setCurrentDate(newDate);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const getEventColor = (schedule: typeof schedules[0]) => {
    if (displaySettings.colorScheme === 'status') {
      return statusColors[schedule.status].split(' ')[0];
    } else if (displaySettings.colorScheme === 'category') {
      const content = getContentById(schedule.contentIds[0]);
      return content ? categoryColors[content.category] : 'bg-muted';
    } else {
      // Branch-based coloring
      if (schedule.branchScope === 'all') return 'bg-primary';
      if (schedule.branchScope === 'region') return 'bg-secondary';
      return 'bg-accent';
    }
  };

  const selectedDaySchedules = selectedDate ? getSchedulesForDay(selectedDate) : [];

  const regions = [...new Set(branches.map(b => b.region))];
  const categories = Object.keys(categoryLabels);
  const contentTypes = ['image', 'video', 'text'];
  const statuses = Object.keys(statusLabels);

  const resetSettings = () => {
    setDisplaySettings(defaultDisplaySettings);
    setFilterSettings(defaultFilterSettings);
  };

  const activeFilterCount = 
    (filterSettings.statuses.length > 0 && filterSettings.statuses.length < statuses.length ? 1 : 0) +
    (filterSettings.categories.length > 0 ? 1 : 0) +
    (filterSettings.contentTypes.length > 0 ? 1 : 0) +
    (filterSettings.regions.length > 0 ? 1 : 0);

  const formatDateRange = () => {
    if (viewMode === 'month') {
      return `${year}年 ${month + 1}月`;
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getFullYear()}年 ${startOfWeek.getMonth() + 1}月 ${startOfWeek.getDate()}日 - ${endOfWeek.getDate()}日`;
      } else {
        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
      }
    } else {
      return `${year}年 ${month + 1}月 ${currentDate.getDate()}日（${daysOfWeekFull[currentDate.getDay()]}）`;
    }
  };

  // Time slots for day/week view
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  return (
    <AppLayout title="配信カレンダー" subtitle="スケジュールを視覚的に管理">
      <div className="space-y-3 md:space-y-4">
        {/* Toolbar */}
        <div className="app-card p-3 md:p-4">
          <div className="flex flex-col gap-3">
            {/* Mobile: Compact navigation */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 shrink-0" onClick={() => navigateCalendar(-1)}>
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <h2 className="text-sm md:text-lg font-bold text-center truncate flex-1">
                  {formatDateRange()}
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 shrink-0" onClick={() => navigateCalendar(1)}>
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex ml-1 md:ml-2 h-8 text-xs md:text-sm">
                  今日
                </Button>
              </div>

              {/* Desktop: Full tabs */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="hidden md:block">
                <TabsList className="rounded-xl">
                  <TabsTrigger value="month" className="rounded-lg gap-1.5">
                    <LayoutGrid className="h-4 w-4" />
                    月
                  </TabsTrigger>
                  <TabsTrigger value="week" className="rounded-lg gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    週
                  </TabsTrigger>
                  <TabsTrigger value="day" className="rounded-lg gap-1.5">
                    <List className="h-4 w-4" />
                    日
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Mobile: View mode tabs + Today button */}
            <div className="flex items-center justify-between gap-2 md:hidden">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="flex-1">
                <TabsList className="rounded-xl w-full grid grid-cols-3">
                  <TabsTrigger value="month" className="rounded-lg text-xs gap-1 px-2">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    月
                  </TabsTrigger>
                  <TabsTrigger value="week" className="rounded-lg text-xs gap-1 px-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    週
                  </TabsTrigger>
                  <TabsTrigger value="day" className="rounded-lg text-xs gap-1 px-2">
                    <List className="h-3.5 w-3.5" />
                    日
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs shrink-0">
                今日
              </Button>
            </div>

            {/* Bottom row: Filters and Settings */}
            <div className="flex items-center justify-between border-t border-border pt-3 gap-2">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                {/* Filter Popover */}
                <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 md:gap-2 rounded-xl h-8 text-xs md:text-sm px-2.5 md:px-3">
                      <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="hidden xs:inline">フィルター</span>
                      {activeFilterCount > 0 && (
                        <Badge className="ml-0.5 h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-popover" align="start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">フィルター設定</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setFilterSettings(defaultFilterSettings)}
                          className="h-8 text-xs"
                        >
                          リセット
                        </Button>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">ステータス</Label>
                        <div className="flex flex-wrap gap-2">
                          {statuses.map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                setFilterSettings(prev => ({
                                  ...prev,
                                  statuses: prev.statuses.includes(status)
                                    ? prev.statuses.filter(s => s !== status)
                                    : [...prev.statuses, status]
                                }));
                              }}
                              className={cn(
                                'px-2.5 py-1 text-xs rounded-full transition-all',
                                filterSettings.statuses.includes(status)
                                  ? statusColors[status]
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Region Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">エリア</Label>
                        <div className="flex flex-wrap gap-2">
                          {regions.map(region => (
                            <button
                              key={region}
                              onClick={() => {
                                setFilterSettings(prev => ({
                                  ...prev,
                                  regions: prev.regions.includes(region)
                                    ? prev.regions.filter(r => r !== region)
                                    : [...prev.regions, region]
                                }));
                              }}
                              className={cn(
                                'px-2.5 py-1 text-xs rounded-full transition-all',
                                filterSettings.regions.includes(region)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {region}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">カテゴリ</Label>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(category => (
                            <button
                              key={category}
                              onClick={() => {
                                setFilterSettings(prev => ({
                                  ...prev,
                                  categories: prev.categories.includes(category)
                                    ? prev.categories.filter(c => c !== category)
                                    : [...prev.categories, category]
                                }));
                              }}
                              className={cn(
                                'px-2.5 py-1 text-xs rounded-full transition-all',
                                filterSettings.categories.includes(category)
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Content Type Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">コンテンツ種別</Label>
                        <div className="flex flex-wrap gap-2">
                          {contentTypes.map(type => (
                            <button
                              key={type}
                              onClick={() => {
                                setFilterSettings(prev => ({
                                  ...prev,
                                  contentTypes: prev.contentTypes.includes(type)
                                    ? prev.contentTypes.filter(t => t !== type)
                                    : [...prev.contentTypes, type]
                                }));
                              }}
                              className={cn(
                                'px-2.5 py-1 text-xs rounded-full transition-all',
                                filterSettings.contentTypes.includes(type)
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {type === 'image' ? '画像' : type === 'video' ? '動画' : 'テキスト'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Active Filters Display - Hidden on mobile */}
                {activeFilterCount > 0 && (
                  <div className="hidden sm:flex items-center gap-1 flex-wrap">
                    {filterSettings.regions.map(region => (
                      <Badge 
                        key={region} 
                        variant="secondary" 
                        className="gap-1 cursor-pointer text-xs"
                        onClick={() => setFilterSettings(prev => ({
                          ...prev,
                          regions: prev.regions.filter(r => r !== region)
                        }))}
                      >
                        {region}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                    {filterSettings.categories.map(cat => (
                      <Badge 
                        key={cat} 
                        variant="secondary" 
                        className="gap-1 cursor-pointer text-xs"
                        onClick={() => setFilterSettings(prev => ({
                          ...prev,
                          categories: prev.categories.filter(c => c !== cat)
                        }))}
                      >
                        {categoryLabels[cat as keyof typeof categoryLabels]}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                {/* Display Settings Popover */}
                <Popover open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 md:gap-2 rounded-xl h-8 text-xs md:text-sm px-2.5 md:px-3">
                      <Settings2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="hidden xs:inline">表示設定</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-popover" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">表示設定</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDisplaySettings(defaultDisplaySettings)}
                          className="h-8 text-xs gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          リセット
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showWeekends" className="text-sm">週末を表示</Label>
                          <Switch
                            id="showWeekends"
                            checked={displaySettings.showWeekends}
                            onCheckedChange={(checked) => 
                              setDisplaySettings(prev => ({ ...prev, showWeekends: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="showEmptyDays" className="text-sm">空の日を表示</Label>
                          <Switch
                            id="showEmptyDays"
                            checked={displaySettings.showEmptyDays}
                            onCheckedChange={(checked) => 
                              setDisplaySettings(prev => ({ ...prev, showEmptyDays: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="compactMode" className="text-sm">コンパクト表示</Label>
                          <Switch
                            id="compactMode"
                            checked={displaySettings.compactMode}
                            onCheckedChange={(checked) => 
                              setDisplaySettings(prev => ({ ...prev, compactMode: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="highlightToday" className="text-sm">今日をハイライト</Label>
                          <Switch
                            id="highlightToday"
                            checked={displaySettings.highlightToday}
                            onCheckedChange={(checked) => 
                              setDisplaySettings(prev => ({ ...prev, highlightToday: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="showStatusBadges" className="text-sm">ステータスバッジ</Label>
                          <Switch
                            id="showStatusBadges"
                            checked={displaySettings.showStatusBadges}
                            onCheckedChange={(checked) => 
                              setDisplaySettings(prev => ({ ...prev, showStatusBadges: checked }))
                            }
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            カラースキーム
                          </Label>
                          <Select 
                            value={displaySettings.colorScheme} 
                            onValueChange={(v) => setDisplaySettings(prev => ({ ...prev, colorScheme: v as ColorScheme }))}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status">ステータス別</SelectItem>
                              <SelectItem value="category">カテゴリ別</SelectItem>
                              <SelectItem value="branch">配信範囲別</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">1日の最大表示数</Label>
                          <Select 
                            value={String(displaySettings.maxEventsPerDay)} 
                            onValueChange={(v) => setDisplaySettings(prev => ({ ...prev, maxEventsPerDay: Number(v) }))}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3件</SelectItem>
                              <SelectItem value="5">5件</SelectItem>
                              <SelectItem value="10">10件</SelectItem>
                              <SelectItem value="999">すべて</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetSettings}>
                  <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="app-card p-2 md:p-4 overflow-x-auto">
          {viewMode === 'month' && (
            <>
              {/* Day Headers */}
              <div className={cn(
                "grid gap-0.5 md:gap-1 mb-1 md:mb-2 min-w-[280px]",
                displaySettings.showWeekends ? "grid-cols-7" : "grid-cols-5"
              )}>
                {daysOfWeek
                  .filter((_, index) => displaySettings.showWeekends || (index !== 0 && index !== 6))
                  .map((day, index) => {
                    const actualIndex = displaySettings.showWeekends ? index : index + 1;
                    return (
                      <div
                        key={day}
                        className={cn(
                          'text-center text-xs md:text-sm font-medium py-1.5 md:py-2',
                          actualIndex === 0 && 'text-destructive',
                          actualIndex === 6 && 'text-primary'
                        )}
                      >
                        {day}
                      </div>
                    );
                  })}
              </div>

              {/* Calendar Grid */}
              <div className={cn(
                "grid gap-0.5 md:gap-1 min-w-[280px]",
                displaySettings.showWeekends ? "grid-cols-7" : "grid-cols-5"
              )}>
                {calendarData
                  .filter((date) => {
                    if (!displaySettings.showWeekends && date && isWeekend(date)) return false;
                    return true;
                  })
                  .map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className={cn(
                        "aspect-square md:aspect-auto",
                        displaySettings.compactMode ? "aspect-square" : "md:min-h-24"
                      )} />;
                    }

                    const daySchedules = getSchedulesForDay(date);
                    const isSelected = selectedDate?.getTime() === date.getTime();
                    const hasSchedules = daySchedules.length > 0;
                    // Show fewer events on mobile
                    const mobileMax = 2;
                    const displayedSchedules = daySchedules.slice(0, window.innerWidth < 768 ? mobileMax : displaySettings.maxEventsPerDay);
                    const hiddenCount = daySchedules.length - displayedSchedules.length;

                    if (!displaySettings.showEmptyDays && !hasSchedules && !isToday(date)) {
                      return <div key={date.toISOString()} className={cn(
                        "aspect-square md:aspect-auto",
                        displaySettings.compactMode ? "aspect-square" : "md:min-h-24"
                      )} />;
                    }

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          'p-1 md:p-1.5 rounded-lg md:rounded-xl transition-all relative text-left',
                          "aspect-square md:aspect-auto",
                          displaySettings.compactMode ? "aspect-square" : "md:min-h-24",
                          displaySettings.highlightToday && isToday(date) && 'ring-2 ring-primary',
                          isSelected && 'bg-primary/10 ring-2 ring-primary',
                          !isSelected && 'hover:bg-muted active:bg-muted',
                          date.getDay() === 0 && !isSelected && 'text-destructive',
                          date.getDay() === 6 && !isSelected && 'text-primary'
                        )}
                      >
                        <span className={cn(
                          "text-xs md:text-sm font-medium",
                          isToday(date) && displaySettings.highlightToday && "bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-[10px] md:text-sm"
                        )}>
                          {date.getDate()}
                        </span>
                        
                        {/* Desktop: Show event names */}
                        {!displaySettings.compactMode && hasSchedules && (
                          <div className="hidden md:block mt-1 space-y-0.5">
                            {displayedSchedules.map((schedule) => (
                              <div
                                key={schedule.id}
                                className={cn(
                                  'text-xs px-1.5 py-0.5 rounded truncate',
                                  getEventColor(schedule),
                                  'text-white'
                                )}
                                title={schedule.name}
                              >
                                {schedule.name}
                              </div>
                            ))}
                            {hiddenCount > 0 && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{hiddenCount}件
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mobile: Always show dots for events */}
                        {hasSchedules && (
                          <div className="md:hidden absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {daySchedules.slice(0, 3).map((s, i) => (
                              <div
                                key={s.id}
                                className={cn(
                                  'h-1 w-1 rounded-full',
                                  getEventColor(s)
                                )}
                              />
                            ))}
                            {daySchedules.length > 3 && (
                              <span className="text-[8px] text-muted-foreground leading-none">+</span>
                            )}
                          </div>
                        )}

                        {/* Desktop compact mode */}
                        {displaySettings.compactMode && hasSchedules && (
                          <div className="hidden md:flex absolute bottom-1 left-1/2 -translate-x-1/2 gap-0.5">
                            {daySchedules.slice(0, 3).map((s) => (
                              <div
                                key={s.id}
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full',
                                  getEventColor(s)
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </>
          )}

          {viewMode === 'week' && (
            <div className="space-y-2 min-w-[500px] md:min-w-0">
              {/* Week Header */}
              <div className={cn(
                "grid gap-1 md:gap-2",
                displaySettings.showWeekends ? "grid-cols-8" : "grid-cols-6"
              )}>
                <div className="text-xs md:text-sm font-medium text-muted-foreground py-2 text-center">時間</div>
                {(calendarData as Date[])
                  .filter(date => displaySettings.showWeekends || !isWeekend(date))
                  .map(date => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'text-center py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all',
                        isToday(date) && displaySettings.highlightToday && 'bg-primary text-primary-foreground',
                        selectedDate?.getTime() === date.getTime() && 'ring-2 ring-primary',
                        !isToday(date) && 'hover:bg-muted active:bg-muted'
                      )}
                    >
                      <div className="text-xs md:text-sm font-medium">{daysOfWeek[date.getDay()]}</div>
                      <div className="text-sm md:text-lg font-bold">{date.getDate()}</div>
                    </button>
                  ))}
              </div>

              {/* Time slots */}
              <div className="space-y-0.5 md:space-y-1">
                {timeSlots.map(time => (
                  <div key={time} className={cn(
                    "grid gap-1 md:gap-2 min-h-12 md:min-h-16",
                    displaySettings.showWeekends ? "grid-cols-8" : "grid-cols-6"
                  )}>
                    <div className="text-[10px] md:text-xs text-muted-foreground py-1.5 md:py-2 border-r border-border text-center">
                      {time}
                    </div>
                    {(calendarData as Date[])
                      .filter(date => displaySettings.showWeekends || !isWeekend(date))
                      .map(date => {
                        const daySchedules = getSchedulesForDay(date);
                        const timeSchedules = daySchedules.filter(s => {
                          const [startHour] = s.timeRange.split('-')[0].split(':').map(Number);
                          return startHour === parseInt(time);
                        });

                        return (
                          <div key={`${date.toISOString()}-${time}`} className="border-b border-border/50 p-0.5 md:p-1">
                            {timeSchedules.slice(0, 1).map(schedule => (
                              <div
                                key={schedule.id}
                                className={cn(
                                  'text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded mb-0.5 truncate cursor-pointer',
                                  getEventColor(schedule),
                                  'text-white'
                                )}
                                onClick={() => setSelectedDate(date)}
                              >
                                <span className="hidden md:inline">{schedule.name}</span>
                                <span className="md:hidden">{schedule.name.slice(0, 4)}</span>
                              </div>
                            ))}
                            {timeSchedules.length > 1 && (
                              <div className="text-[9px] md:text-xs text-muted-foreground text-center">
                                +{timeSchedules.length - 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-3 md:space-y-4">
              <div className="text-center py-2 md:py-4">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full text-xl md:text-2xl font-bold",
                  isToday(currentDate) && displaySettings.highlightToday 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  {currentDate.getDate()}
                </div>
                <div className="text-base md:text-lg font-medium mt-1.5 md:mt-2">
                  {daysOfWeekFull[currentDate.getDay()]}
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                {timeSlots.map(time => {
                  const daySchedules = getSchedulesForDay(currentDate);
                  const timeSchedules = daySchedules.filter(s => {
                    const [startHour] = s.timeRange.split('-')[0].split(':').map(Number);
                    return startHour === parseInt(time);
                  });

                  return (
                    <div key={time} className="flex gap-2 md:gap-4 min-h-12 md:min-h-16 border-b border-border/50 py-1.5 md:py-2">
                      <div className="w-12 md:w-16 text-xs md:text-sm text-muted-foreground shrink-0">
                        {time}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        {timeSchedules.map(schedule => {
                          const mainContent = getContentById(schedule.contentIds[0]);
                          return (
                            <div
                              key={schedule.id}
                              className={cn(
                                'p-2 md:p-3 rounded-lg md:rounded-xl border-l-4 bg-card',
                                getEventColor(schedule).replace('bg-', 'border-l-')
                              )}
                            >
                              <div className="flex items-start md:items-center justify-between gap-2">
                                <span className="font-medium text-sm md:text-base truncate">{schedule.name}</span>
                                {displaySettings.showStatusBadges && (
                                  <Badge className={cn(statusColors[schedule.status], "text-[10px] md:text-xs shrink-0")}>
                                    {statusLabels[schedule.status]}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 md:gap-4 mt-1.5 md:mt-2 text-xs md:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {schedule.timeRange}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.branchScope === 'all' ? '全店舗' :
                                   schedule.branchScope === 'region' ? schedule.region :
                                   `${schedule.branchIds.length}店舗`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Day Details (Month/Week view) */}
        {selectedDate && viewMode !== 'day' && (
          <div className="space-y-3 md:space-y-4 animate-fade-in">
            <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日（{daysOfWeek[selectedDate.getDay()]}）
            </h3>

            {selectedDaySchedules.length === 0 ? (
              <div className="app-card p-6 md:p-8 text-center">
                <p className="text-sm md:text-base text-muted-foreground">この日の配信スケジュールはありません</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {selectedDaySchedules.map((schedule, index) => {
                  const mainContent = getContentById(schedule.contentIds[0]);
                  
                  return (
                    <div
                      key={schedule.id}
                      className="app-card p-3 md:p-4 border-l-4 animate-fade-in"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        borderLeftColor: schedule.status === 'running' 
                          ? 'hsl(var(--success))' 
                          : schedule.status === 'pending'
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-foreground text-sm md:text-base">{schedule.name}</h4>
                        {displaySettings.showStatusBadges && (
                          <Badge className={cn(statusColors[schedule.status], "text-[10px] md:text-xs shrink-0")}>
                            {statusLabels[schedule.status]}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          {schedule.timeRange}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                          {schedule.branchScope === 'all' ? '全店舗' :
                           schedule.branchScope === 'region' ? schedule.region :
                           `${schedule.branchIds.length}店舗`}
                        </div>
                      </div>

                      {mainContent && (
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
                          <Badge variant="secondary" className="text-[10px] md:text-xs">
                            {categoryLabels[mainContent.category]}
                          </Badge>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {schedule.contentIds.length}件のコンテンツ
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="app-card p-3 md:p-4">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h4 className="text-xs md:text-sm font-medium">凡例</h4>
            <span className="text-[10px] md:text-xs text-muted-foreground">
              カラー: {displaySettings.colorScheme === 'status' ? 'ステータス別' : 
                       displaySettings.colorScheme === 'category' ? 'カテゴリ別' : '配信範囲別'}
            </span>
          </div>
          
          {displaySettings.colorScheme === 'status' && (
            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-success" />
                <span className="text-xs md:text-sm text-muted-foreground">配信中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-warning" />
                <span className="text-xs md:text-sm text-muted-foreground">承認待ち</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary" />
                <span className="text-xs md:text-sm text-muted-foreground">承認済み</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-muted" />
                <span className="text-xs md:text-sm text-muted-foreground">下書き</span>
              </div>
            </div>
          )}

          {displaySettings.colorScheme === 'category' && (
            <div className="flex flex-wrap gap-2 md:gap-3">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={cn("h-2.5 w-2.5 md:h-3 md:w-3 rounded-full", categoryColors[key])} />
                  <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          )}

          {displaySettings.colorScheme === 'branch' && (
            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-primary" />
                <span className="text-xs md:text-sm text-muted-foreground">全店舗配信</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-secondary" />
                <span className="text-xs md:text-sm text-muted-foreground">エリア配信</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-accent" />
                <span className="text-xs md:text-sm text-muted-foreground">個別店舗配信</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
