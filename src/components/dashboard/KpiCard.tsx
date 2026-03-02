import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}

export function KpiCard({ title, value, trend, trendLabel, icon, className, delay = 0 }: KpiCardProps) {
  const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;
  
  return (
    <div 
      className={cn('kpi-card animate-slide-up group', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="kpi-label mb-2">{title}</p>
          <p className="kpi-value">{value}</p>
          {trend !== undefined && (
            <div className={cn(
              'mt-3',
              trend > 0 ? 'kpi-trend-up' : trend < 0 ? 'kpi-trend-down' : 'text-muted-foreground text-sm px-2 py-0.5 rounded-full bg-muted'
            )}>
              <TrendIcon className="h-4 w-4" />
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
              {trendLabel && <span className="text-muted-foreground ml-1 text-xs">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
