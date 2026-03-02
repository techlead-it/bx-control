import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, Monitor, MapPin, ChevronRight, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { branches, kpiDaily, signageDevices } from '@/lib/dummyData';
import { cn } from '@/lib/utils';

const regions = ['すべて', '関東', '関西', '中部', '九州', '北海道', '東北', '中国'];

export default function Branches() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('すべて');

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.address.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === 'すべて' || branch.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const getBranchTodayKpi = (branchId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKpi = kpiDaily.find(k => {
      const kpiDate = new Date(k.date);
      kpiDate.setHours(0, 0, 0, 0);
      return k.branchId === branchId && kpiDate.getTime() === today.getTime();
    });
    return todayKpi || { consultCount: 0, proposalCount: 0, contractCount: 0 };
  };

  const getBranchDeviceStatus = (branchId: string) => {
    const devices = signageDevices.filter(d => d.branchId === branchId);
    const online = devices.filter(d => d.status === 'online').length;
    const total = devices.length;
    return { online, total, allOnline: online === total };
  };

  const branchTypeLabels: Record<string, string> = {
    large: '大型店',
    consultation: '相談特化',
    small: '小型店',
  };

  return (
    <AppLayout title="店舗一覧" subtitle={`${branches.length}店舗`}>
      <div className="space-y-6">
        {/* Search */}
        <div className="search-bar">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="店舗名・住所で検索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Region Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className={cn(
                'filter-chip whitespace-nowrap',
                regionFilter === region && 'filter-chip-active'
              )}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Branch Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBranches.map((branch, index) => {
            const kpi = getBranchTodayKpi(branch.id);
            const deviceStatus = getBranchDeviceStatus(branch.id);
            
            return (
              <Link
                key={branch.id}
                to={`/branches/${branch.id}`}
                className="branch-card group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {branch.region}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="rounded-lg">
                    {branchTypeLabels[branch.branchType]}
                  </Badge>
                  <div className={cn(
                    'status-pill',
                    deviceStatus.allOnline ? 'status-online' : 'status-offline'
                  )}>
                    <Monitor className="h-3 w-3" />
                    {deviceStatus.online}/{deviceStatus.total}
                  </div>
                </div>

                {/* KPI Summary */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{kpi.consultCount}</p>
                    <p className="text-xs text-muted-foreground">相談</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{kpi.proposalCount}</p>
                    <p className="text-xs text-muted-foreground">提案</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{kpi.contractCount}</p>
                    <p className="text-xs text-muted-foreground">成約</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredBranches.length === 0 && (
          <div className="empty-state">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">該当する店舗がありません</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
