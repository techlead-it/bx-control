import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, Calendar, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { leads, getBranchById, topicLabels, stageLabels, sourceLabels, getContentById } from '@/lib/dummyData';
import { cn } from '@/lib/utils';

const stages = ['all', 'consult', 'proposal', 'application', 'contract', 'lost'] as const;

export default function Sfa() {
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter(lead => {
    const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
    return matchesStage;
  });

  const stageCounts = {
    all: leads.length,
    consult: leads.filter(l => l.stage === 'consult').length,
    proposal: leads.filter(l => l.stage === 'proposal').length,
    application: leads.filter(l => l.stage === 'application').length,
    contract: leads.filter(l => l.stage === 'contract').length,
    lost: leads.filter(l => l.stage === 'lost').length,
  };

  const stageColors: Record<string, string> = {
    consult: 'border-l-chart-1',
    proposal: 'border-l-chart-2',
    application: 'border-l-chart-3',
    contract: 'border-l-success',
    lost: 'border-l-muted-foreground',
  };

  return (
    <AppLayout title="SFA" subtitle={`${leads.length}件の案件`}>
      <div className="space-y-6">
        {/* Search */}
        <div className="search-bar">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="案件を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Stage Tabs */}
        <div className="tab-bar overflow-x-auto scrollbar-hide">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={cn(
                'tab-item whitespace-nowrap',
                stageFilter === stage && 'tab-item-active'
              )}
            >
              {stage === 'all' ? 'すべて' : stageLabels[stage]}
              <span className="ml-1.5 text-xs opacity-70">({stageCounts[stage]})</span>
            </button>
          ))}
        </div>

        {/* Lead Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.slice(0, 12).map((lead, index) => {
            const branch = getBranchById(lead.branchId);
            const content = lead.relatedContentId ? getContentById(lead.relatedContentId) : null;
            
            return (
              <div
                key={lead.id}
                className={cn(
                  'app-card-interactive p-4 border-l-4',
                  stageColors[lead.stage],
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`stage-${lead.stage}`}>
                    {stageLabels[lead.stage]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-2">
                  {topicLabels[lead.topic]}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{branch?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{lead.customerType === 'new' ? '新規顧客' : '既存顧客'}</span>
                    <span>・</span>
                    <span>{sourceLabels[lead.source]}</span>
                  </div>
                </div>

                {content && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      📺 {content.title}
                    </p>
                  </div>
                )}

                {lead.notes && (
                  <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                    {lead.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {filteredLeads.length > 12 && (
          <div className="text-center">
            <button className="text-sm text-primary font-medium hover:underline">
              さらに{filteredLeads.length - 12}件を表示
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
