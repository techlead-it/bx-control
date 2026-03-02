import { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, Sparkles, FileText, Plus, Building2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  customerReactions, 
  branches, 
  contents, 
  getBranchById, 
  getContentById,
  getDevicesByBranchId,
  reactionTypeLabels,
  type ReactionType
} from '@/lib/dummyData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const reactionIcons: Record<ReactionType, React.ReactNode> = {
  interested: <Sparkles className="h-4 w-4" />,
  question: <HelpCircle className="h-4 w-4" />,
  positive: <ThumbsUp className="h-4 w-4" />,
  negative: <ThumbsDown className="h-4 w-4" />,
  pamphlet_taken: <FileText className="h-4 w-4" />,
};

const reactionColors: Record<ReactionType, string> = {
  interested: 'bg-primary/10 text-primary border-primary/20',
  question: 'bg-accent/10 text-accent border-accent/20',
  positive: 'bg-success/10 text-success border-success/20',
  negative: 'bg-destructive/10 text-destructive border-destructive/20',
  pamphlet_taken: 'bg-warning/10 text-warning border-warning/20',
};

const quickReactions: ReactionType[] = ['interested', 'question', 'positive', 'negative', 'pamphlet_taken'];

export default function Reactions() {
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [reactionFilter, setReactionFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReaction, setNewReaction] = useState({
    branchId: '',
    contentId: '',
    reactionType: '' as ReactionType,
    notes: '',
  });

  const filteredReactions = customerReactions.filter(r => {
    if (branchFilter !== 'all' && r.branchId !== branchFilter) return false;
    if (reactionFilter !== 'all' && r.reactionType !== reactionFilter) return false;
    return true;
  }).slice(0, 50);

  // Reaction stats
  const reactionStats = quickReactions.map(type => ({
    type,
    count: customerReactions.filter(r => 
      r.reactionType === type && 
      (branchFilter === 'all' || r.branchId === branchFilter)
    ).length,
  }));

  const handleQuickReaction = (type: ReactionType, branchId: string, contentId: string) => {
    toast.success(`${reactionTypeLabels[type]}を記録しました`);
  };

  const handleSubmitReaction = () => {
    if (!newReaction.branchId || !newReaction.contentId || !newReaction.reactionType) {
      toast.error('必須項目を入力してください');
      return;
    }
    toast.success('反応を記録しました');
    setDialogOpen(false);
    setNewReaction({ branchId: '', contentId: '', reactionType: '' as ReactionType, notes: '' });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
  };

  return (
    <AppLayout title="お客様反応メモ" subtitle="サイネージへの反応を記録">
      <div className="space-y-6">
        {/* Quick Record Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-primary text-white shadow-lg shadow-primary/20 rounded-2xl h-14 text-base">
              <Plus className="h-5 w-5 mr-2" />
              反応を記録する
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>お客様反応を記録</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">店舗</label>
                <Select value={newReaction.branchId} onValueChange={(v) => setNewReaction(prev => ({ ...prev, branchId: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="店舗を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">コンテンツ</label>
                <Select value={newReaction.contentId} onValueChange={(v) => setNewReaction(prev => ({ ...prev, contentId: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="コンテンツを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {contents.slice(0, 10).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">反応タイプ</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickReactions.map(type => (
                    <button
                      key={type}
                      onClick={() => setNewReaction(prev => ({ ...prev, reactionType: type }))}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        newReaction.reactionType === type
                          ? reactionColors[type]
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {reactionIcons[type]}
                      <span className="text-sm font-medium">{reactionTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">メモ (任意)</label>
                <Textarea
                  placeholder="お客様の反応の詳細..."
                  value={newReaction.notes}
                  onChange={(e) => setNewReaction(prev => ({ ...prev, notes: e.target.value }))}
                  className="rounded-xl"
                />
              </div>

              <Button onClick={handleSubmitReaction} className="w-full rounded-xl">
                記録する
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reaction Stats */}
        <div className="grid grid-cols-5 gap-2">
          {reactionStats.map(stat => (
            <button
              key={stat.type}
              onClick={() => setReactionFilter(reactionFilter === stat.type ? 'all' : stat.type)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all text-center',
                reactionFilter === stat.type
                  ? reactionColors[stat.type]
                  : 'border-border hover:border-primary/30'
              )}
            >
              <div className="flex justify-center mb-1">
                {reactionIcons[stat.type]}
              </div>
              <p className="text-lg font-bold">{stat.count}</p>
              <p className="text-[10px] text-muted-foreground truncate">{reactionTypeLabels[stat.type]}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="店舗" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全店舗</SelectItem>
              {branches.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reaction List */}
        <div className="space-y-3">
          {filteredReactions.map((reaction, index) => {
            const branch = getBranchById(reaction.branchId);
            const content = getContentById(reaction.contentId);

            return (
              <div
                key={reaction.id}
                className="app-card p-4 animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                    reactionColors[reaction.reactionType]
                  )}>
                    {reactionIcons[reaction.reactionType]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {reactionTypeLabels[reaction.reactionType]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(reaction.recordedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 truncate">
                      {content?.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {branch?.name}
                    </div>
                    {reaction.notes && (
                      <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                        {reaction.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
