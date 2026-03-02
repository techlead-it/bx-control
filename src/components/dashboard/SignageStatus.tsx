import { Monitor, CheckCircle, Clock, WifiOff } from 'lucide-react';
import { schedules, signageDevices } from '@/lib/dummyData';

export function SignageStatus() {
  const runningSchedules = schedules.filter(s => s.status === 'running').length;
  const pendingSchedules = schedules.filter(s => s.status === 'pending').length;
  const offlineDevices = signageDevices.filter(d => d.status === 'offline').length;

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">サイネージ運用状況</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 rounded-xl bg-success/5 border border-success/10 transition-all duration-200 hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mx-auto mb-3">
            <CheckCircle className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-success">{runningSchedules}</p>
          <p className="text-xs text-muted-foreground mt-1">配信中</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-warning/5 border border-warning/10 transition-all duration-200 hover:scale-105">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning mx-auto mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-warning">{pendingSchedules}</p>
          <p className="text-xs text-muted-foreground mt-1">承認待ち</p>
        </div>
        <div className={`text-center p-4 rounded-xl transition-all duration-200 hover:scale-105 ${offlineDevices > 0 ? 'bg-destructive/5 border border-destructive/10' : 'bg-muted/50 border border-border/50'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3 ${offlineDevices > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
            <WifiOff className="h-6 w-6" />
          </div>
          <p className={`text-2xl font-bold ${offlineDevices > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{offlineDevices}</p>
          <p className="text-xs text-muted-foreground mt-1">オフライン</p>
        </div>
      </div>
    </div>
  );
}
