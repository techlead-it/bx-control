import { AlertTriangle, WifiOff, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'offline' | 'kpi_drop' | 'pending';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

const alertIcons: Record<AlertType, React.ReactNode> = {
  offline: <WifiOff className="h-4 w-4" />,
  kpi_drop: <TrendingDown className="h-4 w-4" />,
  pending: <AlertTriangle className="h-4 w-4" />,
};

const alertStyles: Record<AlertType, string> = {
  offline: 'bg-destructive/10 text-destructive border-destructive/20',
  kpi_drop: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-accent/10 text-accent border-accent/20',
};

export function AlertCard({ alerts }: AlertCardProps) {
  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '350ms' }}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">重要アラート</h3>
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mx-auto mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">アラートはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer animate-slide-up',
                alertStyles[alert.type]
              )}
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <div className="mt-0.5 p-2 rounded-lg bg-current/10">{alertIcons[alert.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="text-xs opacity-80 mt-1">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
