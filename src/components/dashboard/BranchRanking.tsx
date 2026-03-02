import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Branch } from '@/lib/dummyData';

interface RankingItem {
  branch: Branch;
  value: number;
  trend: number;
}

interface BranchRankingProps {
  title: string;
  items: RankingItem[];
  valueLabel?: string;
  showTrend?: boolean;
  isPositive?: boolean;
}

export function BranchRanking({ title, items, valueLabel = '件', showTrend = true, isPositive = true }: BranchRankingProps) {
  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, index) => (
          <Link
            key={item.branch.id}
            to={`/branches/${item.branch.id}`}
            className="flex items-center gap-3 group p-3 rounded-xl hover:bg-primary/5 transition-all duration-200"
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition-transform duration-200 group-hover:scale-110',
              index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30' :
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
              <p className="text-xs text-muted-foreground">{item.branch.region}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{item.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{valueLabel}</span></p>
              {showTrend && (
                <p className={cn(
                  'text-xs flex items-center gap-0.5 justify-end font-medium',
                  (isPositive ? item.trend > 0 : item.trend < 0) ? 'text-success' : 
                  (isPositive ? item.trend < 0 : item.trend > 0) ? 'text-destructive' : 
                  'text-muted-foreground'
                )}>
                  {item.trend > 0 ? <TrendingUp className="h-3 w-3" /> : item.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
