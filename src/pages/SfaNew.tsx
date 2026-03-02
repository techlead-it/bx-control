import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Zap, ChevronRight, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { branches, contents, topicLabels, sourceLabels, amountLabels, categoryLabels, getSchedulesByBranchId, getContentById } from '@/lib/dummyData';
import { cn } from '@/lib/utils';

export default function SfaNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultBranchId = searchParams.get('branch_id') || '';
  
  const [formData, setFormData] = useState({
    branchId: defaultBranchId,
    topic: '',
    stage: 'consult',
    customerType: 'existing',
    source: '',
    relatedContentId: '',
    amountRange: '',
    notes: '',
  });

  const runningContent = formData.branchId 
    ? getSchedulesByBranchId(formData.branchId)
        .filter(s => s.status === 'running')
        .flatMap(s => s.contentIds)
        .map(id => getContentById(id))
        .filter(Boolean)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.branchId || !formData.topic || !formData.source) {
      toast.error('必須項目を入力してください');
      return;
    }

    if (formData.source === 'signage' && !formData.relatedContentId) {
      toast.error('サイネージソースの場合は関連コンテンツを選択してください');
      return;
    }

    toast.success('案件を起票しました');
    navigate('/sfa');
  };

  const isSignageSource = formData.source === 'signage';

  const topics = Object.entries(topicLabels);
  const sources = Object.entries(sourceLabels);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link to="/sfa">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              30秒起票
            </h1>
          </div>
          <Button onClick={handleSubmit} className="bg-gradient-primary rounded-xl">
            起票する
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-8 space-y-6">
        {/* Branch */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">店舗</Label>
          <Select 
            value={formData.branchId} 
            onValueChange={(v) => setFormData({ ...formData, branchId: v, relatedContentId: '' })}
          >
            <SelectTrigger className="h-14 rounded-xl bg-card">
              <SelectValue placeholder="店舗を選択" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card">
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id} className="rounded-lg py-3">
                  {branch.name}（{branch.region}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">トピック</Label>
          <div className="grid grid-cols-2 gap-2">
            {topics.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, topic: value })}
                className={cn(
                  'app-card p-4 text-left transition-all',
                  formData.topic === value 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                    : 'hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  {formData.topic === value && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer Type */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">顧客タイプ</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'existing', label: '既存顧客' },
              { value: 'new', label: '新規顧客' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, customerType: option.value })}
                className={cn(
                  'app-card p-4 text-center transition-all',
                  formData.customerType === option.value 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                    : 'hover:border-primary/50'
                )}
              >
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Source */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">きっかけ</Label>
          <div className="grid grid-cols-3 gap-2">
            {sources.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, source: value, relatedContentId: '' })}
                className={cn(
                  'app-card p-3 text-center text-sm transition-all',
                  formData.source === value 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                    : 'hover:border-primary/50',
                  value === 'signage' && 'col-span-1'
                )}
              >
                {value === 'signage' && <Monitor className="h-4 w-4 mx-auto mb-1" />}
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Related Content */}
        {isSignageSource && (
          <div className="space-y-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5 text-accent" />
              関連コンテンツ
            </Label>
            {runningContent.length > 0 ? (
              <div className="space-y-2">
                {runningContent.map(content => content && (
                  <button
                    key={content.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, relatedContentId: content.id })}
                    className={cn(
                      'w-full app-card p-4 text-left transition-all',
                      formData.relatedContentId === content.id 
                        ? 'border-accent bg-accent/5 ring-2 ring-accent' 
                        : 'hover:border-accent/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {categoryLabels[content.category]}
                        </Badge>
                      </div>
                      {formData.relatedContentId === content.id && (
                        <Check className="h-5 w-5 text-accent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <Select
                value={formData.relatedContentId}
                onValueChange={(v) => setFormData({ ...formData, relatedContentId: v })}
              >
                <SelectTrigger className="h-14 rounded-xl bg-card">
                  <SelectValue placeholder="コンテンツを選択" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card">
                  {contents.map(content => (
                    <SelectItem key={content.id} value={content.id} className="rounded-lg py-3">
                      {content.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Amount (optional) */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-muted-foreground">金額帯（任意）</Label>
          <Select
            value={formData.amountRange}
            onValueChange={(v) => setFormData({ ...formData, amountRange: v })}
          >
            <SelectTrigger className="h-14 rounded-xl bg-card">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card">
              {Object.entries(amountLabels).map(([value, label]) => (
                <SelectItem key={value} value={value} className="rounded-lg py-3">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes (optional) */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-muted-foreground">メモ（任意）</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="例: 住宅購入検討中、来月決定予定"
            className="min-h-[80px] rounded-xl bg-card resize-none"
          />
        </div>
      </main>
    </div>
  );
}
