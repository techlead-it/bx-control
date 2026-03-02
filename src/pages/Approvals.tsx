import { useState } from 'react';
import { CheckCircle, XCircle, Clock, RotateCcw, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  approvalRequests, 
  schedules, 
  getUserById, 
  getContentById,
  approvalStatusLabels,
  categoryLabels,
  type ApprovalStatus
} from '@/lib/dummyData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors: Record<ApprovalStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  revision_requested: 'bg-accent/10 text-accent border-accent/20',
};

const statusIcons: Record<ApprovalStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  revision_requested: <RotateCcw className="h-4 w-4" />,
};

export default function Approvals() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [localRequests, setLocalRequests] = useState(approvalRequests);

  const filteredRequests = localRequests.filter(req => {
    if (filter === 'pending') return req.status === 'pending' || req.status === 'revision_requested';
    if (filter === 'completed') return req.status === 'approved' || req.status === 'rejected';
    return true;
  });

  const pendingCount = localRequests.filter(
    r => r.status === 'pending' || r.status === 'revision_requested'
  ).length;

  const handleApprove = (requestId: string) => {
    setLocalRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'approved' as ApprovalStatus, approvedAt: new Date(), approvedBy: 'user-1' }
          : r
      )
    );
    toast.success('承認しました');
  };

  const handleReject = (requestId: string) => {
    setLocalRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'rejected' as ApprovalStatus, approvedAt: new Date(), approvedBy: 'user-1' }
          : r
      )
    );
    toast.success('却下しました');
  };

  const handleRequestRevision = (requestId: string) => {
    if (!newComment.trim()) {
      toast.error('修正依頼のコメントを入力してください');
      return;
    }
    setLocalRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'revision_requested' as ApprovalStatus,
              comments: [
                ...r.comments,
                {
                  id: `comment-${Date.now()}`,
                  userId: 'user-1',
                  comment: newComment,
                  createdAt: new Date(),
                },
              ],
              revisionCount: r.revisionCount + 1,
            }
          : r
      )
    );
    setNewComment('');
    toast.success('修正依頼を送信しました');
  };

  const addComment = (requestId: string) => {
    if (!newComment.trim()) return;
    setLocalRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              comments: [
                ...r.comments,
                {
                  id: `comment-${Date.now()}`,
                  userId: 'user-1',
                  comment: newComment,
                  createdAt: new Date(),
                },
              ],
            }
          : r
      )
    );
    setNewComment('');
    toast.success('コメントを追加しました');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout title="承認管理" subtitle={`${pendingCount}件の承認待ち`}>
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={cn('filter-chip', filter === 'all' && 'filter-chip-active')}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn('filter-chip', filter === 'pending' && 'filter-chip-active')}
          >
            承認待ち
            {pendingCount > 0 && (
              <Badge className="ml-1.5 bg-warning text-warning-foreground">{pendingCount}</Badge>
            )}
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn('filter-chip', filter === 'completed' && 'filter-chip-active')}
          >
            完了
          </button>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.map((request, index) => {
            const schedule = schedules.find(s => s.id === request.scheduleId);
            const requester = getUserById(request.requestedBy);
            const isExpanded = expandedId === request.id;
            const mainContent = schedule?.contentIds[0] ? getContentById(schedule.contentIds[0]) : null;

            return (
              <div
                key={request.id}
                className="app-card overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn('gap-1', statusColors[request.status])}>
                          {statusIcons[request.status]}
                          {approvalStatusLabels[request.status]}
                        </Badge>
                        {request.revisionCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            修正{request.revisionCount}回
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {schedule?.name || '不明なスケジュール'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>申請者: {requester?.name}</span>
                        <span>•</span>
                        <span>{formatDate(request.requestedAt)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Schedule Details */}
                    <div className="p-4 bg-muted/30">
                      <h4 className="text-sm font-medium mb-3">配信計画の詳細</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">配信範囲</p>
                          <p className="font-medium">
                            {schedule?.branchScope === 'all' ? '全店舗' : 
                             schedule?.branchScope === 'region' ? schedule.region : 
                             '個別店舗'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">時間帯</p>
                          <p className="font-medium">{schedule?.timeRange}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">カテゴリ</p>
                          <p className="font-medium">
                            {mainContent ? categoryLabels[mainContent.category] : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">コンテンツ数</p>
                          <p className="font-medium">{schedule?.contentIds.length}件</p>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="p-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        コメント ({request.comments.length})
                      </h4>
                      <div className="space-y-3 mb-4">
                        {request.comments.map(comment => {
                          const user = getUserById(comment.userId);
                          return (
                            <div key={comment.id} className="flex gap-3">
                              <div className="avatar h-8 w-8 text-xs shrink-0">
                                {user?.name.charAt(0)}
                              </div>
                              <div className="flex-1 bg-muted rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{user?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.comment}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="コメントを追加..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {(request.status === 'pending' || request.status === 'revision_requested') && (
                      <div className="p-4 border-t border-border bg-muted/30 flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="bg-success hover:bg-success/90 text-success-foreground"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          承認
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRequestRevision(request.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          修正依頼
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          却下
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => addComment(request.id)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          コメント送信
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="empty-state py-16">
              <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">承認リクエストはありません</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
