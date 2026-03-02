// Types
export type UserRole = 'admin' | 'hq_manager' | 'branch_manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  region: string;
  address: string;
  branchType: 'large' | 'consultation' | 'small';
  signageDevicesCount: number;
  targetSegments: string[];
  managerUserId: string;
}

export interface SignageDevice {
  id: string;
  branchId: string;
  locationInBranch: 'entrance' | 'waiting' | 'counter';
  status: 'online' | 'offline';
  lastHeartbeatAt: Date;
}

export interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text';
  fileUrl: string;
  category: 'mortgage' | 'asset_management' | 'account' | 'campaign';
  targetSegment: string;
  defaultDurationSec: number;
  createdBy: string;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  branchScope: 'all' | 'region' | 'branch';
  branchIds: string[];
  region?: string;
  daysOfWeek: number[];
  timeRange: string;
  contentIds: string[];
  ruleType: 'fixed' | 'rotation' | 'priority';
  status: 'draft' | 'pending' | 'approved' | 'running' | 'paused';
  approvedBy?: string;
  createdAt: Date;
  name: string;
}

export interface Lead {
  id: string;
  branchId: string;
  createdByUserId: string;
  assignedToUserId: string;
  customerType: 'existing' | 'new';
  topic: 'mortgage' | 'asset_management' | 'inheritance' | 'corporate' | 'other';
  stage: 'consult' | 'proposal' | 'application' | 'contract' | 'lost';
  amountRange: 'under_1m' | 'under_5m' | 'under_10m' | 'over_10m';
  source: 'walk_in' | 'signage' | 'reservation' | 'referral' | 'other';
  relatedContentId?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface KpiDaily {
  id: string;
  branchId: string;
  date: Date;
  walkInCount: number;
  consultCount: number;
  proposalCount: number;
  contractCount: number;
  sfaCreatedCount: number;
  signageImpressions: number;
  signageEngagements: number;
}

// New types for enhanced features
export type NotificationType = 'info' | 'warning' | 'urgent' | 'success';
export type NotificationCategory = 'system' | 'schedule' | 'kpi' | 'announcement';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  targetBranchIds?: string[]; // empty = all branches
  targetRegions?: string[];
  isRead: boolean;
  readByUserIds: string[];
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface ApprovalRequest {
  id: string;
  scheduleId: string;
  requestedBy: string;
  requestedAt: Date;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  comments: ApprovalComment[];
  revisionCount: number;
}

export interface ApprovalComment {
  id: string;
  userId: string;
  comment: string;
  createdAt: Date;
}

export type ReactionType = 'interested' | 'question' | 'positive' | 'negative' | 'pamphlet_taken';

export interface CustomerReaction {
  id: string;
  branchId: string;
  deviceId: string;
  contentId: string;
  reactionType: ReactionType;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

export interface KpiTarget {
  id: string;
  branchId: string;
  month: string; // YYYY-MM format
  targetConsult: number;
  targetProposal: number;
  targetContract: number;
}

// Dummy Data
export const currentUser: User = {
  id: 'user-1',
  name: '山田 太郎',
  email: 'yamada@example.com',
  role: 'hq_manager',
};

export const users: User[] = [
  currentUser,
  { id: 'user-2', name: '佐藤 花子', email: 'sato@example.com', role: 'admin' },
  { id: 'user-3', name: '田中 一郎', email: 'tanaka@example.com', role: 'branch_manager', branchId: 'branch-1' },
  { id: 'user-4', name: '鈴木 美咲', email: 'suzuki@example.com', role: 'staff', branchId: 'branch-1' },
  { id: 'user-5', name: '高橋 健太', email: 'takahashi@example.com', role: 'branch_manager', branchId: 'branch-2' },
  { id: 'user-6', name: '渡辺 裕子', email: 'watanabe@example.com', role: 'staff', branchId: 'branch-2' },
  { id: 'user-7', name: '伊藤 大輔', email: 'ito@example.com', role: 'branch_manager', branchId: 'branch-3' },
  { id: 'user-8', name: '山本 さくら', email: 'yamamoto@example.com', role: 'staff', branchId: 'branch-3' },
];

export const branches: Branch[] = [
  { id: 'branch-1', name: '東京中央支店', region: '関東', address: '東京都中央区日本橋1-1-1', branchType: 'large', signageDevicesCount: 3, targetSegments: ['富裕層', '法人'], managerUserId: 'user-3' },
  { id: 'branch-2', name: '新宿支店', region: '関東', address: '東京都新宿区西新宿2-2-2', branchType: 'large', signageDevicesCount: 2, targetSegments: ['住宅ローン', '若年層'], managerUserId: 'user-5' },
  { id: 'branch-3', name: '横浜支店', region: '関東', address: '神奈川県横浜市中区本町3-3-3', branchType: 'consultation', signageDevicesCount: 2, targetSegments: ['高齢者', '相続'], managerUserId: 'user-7' },
  { id: 'branch-4', name: '大阪本町支店', region: '関西', address: '大阪府大阪市中央区本町4-4-4', branchType: 'large', signageDevicesCount: 3, targetSegments: ['法人', '富裕層'], managerUserId: 'user-3' },
  { id: 'branch-5', name: '京都支店', region: '関西', address: '京都府京都市中京区烏丸通5-5-5', branchType: 'consultation', signageDevicesCount: 2, targetSegments: ['高齢者', '資産運用'], managerUserId: 'user-5' },
  { id: 'branch-6', name: '名古屋支店', region: '中部', address: '愛知県名古屋市中区栄6-6-6', branchType: 'large', signageDevicesCount: 2, targetSegments: ['住宅ローン', '法人'], managerUserId: 'user-7' },
  { id: 'branch-7', name: '福岡支店', region: '九州', address: '福岡県福岡市博多区博多駅7-7-7', branchType: 'consultation', signageDevicesCount: 2, targetSegments: ['若年層', '資産運用'], managerUserId: 'user-3' },
  { id: 'branch-8', name: '札幌支店', region: '北海道', address: '北海道札幌市中央区大通8-8-8', branchType: 'small', signageDevicesCount: 1, targetSegments: ['高齢者', '住宅ローン'], managerUserId: 'user-5' },
  { id: 'branch-9', name: '仙台支店', region: '東北', address: '宮城県仙台市青葉区中央9-9-9', branchType: 'small', signageDevicesCount: 1, targetSegments: ['相続', '資産運用'], managerUserId: 'user-7' },
  { id: 'branch-10', name: '広島支店', region: '中国', address: '広島県広島市中区紙屋町10-10-10', branchType: 'consultation', signageDevicesCount: 2, targetSegments: ['法人', '住宅ローン'], managerUserId: 'user-3' },
];

export const signageDevices: SignageDevice[] = branches.flatMap((branch, bi) => 
  Array.from({ length: branch.signageDevicesCount }, (_, i) => ({
    id: `device-${branch.id}-${i + 1}`,
    branchId: branch.id,
    locationInBranch: (['entrance', 'waiting', 'counter'] as const)[i % 3],
    status: (bi === 7 && i === 0) ? 'offline' as const : 'online' as const,
    lastHeartbeatAt: (bi === 7 && i === 0) 
      ? new Date(Date.now() - 1000 * 60 * 60 * 30) 
      : new Date(Date.now() - 1000 * 60 * Math.random() * 10),
  }))
);

export const contents: Content[] = [
  { id: 'content-1', title: '住宅ローン金利キャンペーン', type: 'video', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '住宅ローン', defaultDurationSec: 30, createdBy: 'user-1', createdAt: new Date('2024-01-10') },
  { id: 'content-2', title: '新生活応援 住宅ローン', type: 'image', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '若年層', defaultDurationSec: 15, createdBy: 'user-1', createdAt: new Date('2024-01-12') },
  { id: 'content-3', title: '借り換えキャンペーン', type: 'video', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '住宅ローン', defaultDurationSec: 30, createdBy: 'user-2', createdAt: new Date('2024-01-15') },
  { id: 'content-4', title: 'NISA口座開設キャンペーン', type: 'video', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '若年層', defaultDurationSec: 30, createdBy: 'user-1', createdAt: new Date('2024-01-08') },
  { id: 'content-5', title: '資産運用セミナー案内', type: 'image', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '富裕層', defaultDurationSec: 20, createdBy: 'user-2', createdAt: new Date('2024-01-11') },
  { id: 'content-6', title: '退職金運用プラン', type: 'video', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '高齢者', defaultDurationSec: 30, createdBy: 'user-1', createdAt: new Date('2024-01-14') },
  { id: 'content-7', title: '相続対策セミナー', type: 'video', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '高齢者', defaultDurationSec: 45, createdBy: 'user-2', createdAt: new Date('2024-01-16') },
  { id: 'content-8', title: 'スマホアプリ紹介', type: 'video', fileUrl: '/placeholder.svg', category: 'account', targetSegment: '若年層', defaultDurationSec: 20, createdBy: 'user-1', createdAt: new Date('2024-01-09') },
  { id: 'content-9', title: '口座開設キャンペーン', type: 'image', fileUrl: '/placeholder.svg', category: 'account', targetSegment: '新規', defaultDurationSec: 15, createdBy: 'user-2', createdAt: new Date('2024-01-13') },
  { id: 'content-10', title: 'ネットバンキング案内', type: 'image', fileUrl: '/placeholder.svg', category: 'account', targetSegment: '全般', defaultDurationSec: 15, createdBy: 'user-1', createdAt: new Date('2024-01-17') },
  { id: 'content-11', title: '夏のボーナスキャンペーン', type: 'video', fileUrl: '/placeholder.svg', category: 'campaign', targetSegment: '全般', defaultDurationSec: 30, createdBy: 'user-2', createdAt: new Date('2024-01-07') },
  { id: 'content-12', title: 'ポイント還元キャンペーン', type: 'image', fileUrl: '/placeholder.svg', category: 'campaign', targetSegment: '全般', defaultDurationSec: 15, createdBy: 'user-1', createdAt: new Date('2024-01-18') },
  { id: 'content-13', title: '法人口座開設案内', type: 'video', fileUrl: '/placeholder.svg', category: 'account', targetSegment: '法人', defaultDurationSec: 30, createdBy: 'user-2', createdAt: new Date('2024-01-19') },
  { id: 'content-14', title: '事業融資案内', type: 'image', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '法人', defaultDurationSec: 20, createdBy: 'user-1', createdAt: new Date('2024-01-20') },
  { id: 'content-15', title: '教育ローン案内', type: 'video', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '住宅ローン', defaultDurationSec: 25, createdBy: 'user-2', createdAt: new Date('2024-01-21') },
  { id: 'content-16', title: '年末調整セミナー', type: 'image', fileUrl: '/placeholder.svg', category: 'campaign', targetSegment: '全般', defaultDurationSec: 15, createdBy: 'user-1', createdAt: new Date('2024-01-22') },
  { id: 'content-17', title: '確定拠出年金案内', type: 'video', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '若年層', defaultDurationSec: 30, createdBy: 'user-2', createdAt: new Date('2024-01-23') },
  { id: 'content-18', title: '外貨預金キャンペーン', type: 'image', fileUrl: '/placeholder.svg', category: 'asset_management', targetSegment: '富裕層', defaultDurationSec: 15, createdBy: 'user-1', createdAt: new Date('2024-01-24') },
  { id: 'content-19', title: 'ATM手数料無料案内', type: 'text', fileUrl: '/placeholder.svg', category: 'campaign', targetSegment: '全般', defaultDurationSec: 10, createdBy: 'user-2', createdAt: new Date('2024-01-25') },
  { id: 'content-20', title: 'マイカーローン案内', type: 'video', fileUrl: '/placeholder.svg', category: 'mortgage', targetSegment: '若年層', defaultDurationSec: 25, createdBy: 'user-1', createdAt: new Date('2024-01-26') },
];

export const schedules: Schedule[] = [
  { id: 'schedule-1', name: '全国 住宅ローンキャンペーン', branchScope: 'all', branchIds: [], daysOfWeek: [1, 2, 3, 4, 5], timeRange: '09:00-12:00', contentIds: ['content-1', 'content-2'], ruleType: 'rotation', status: 'running', approvedBy: 'user-2', createdAt: new Date('2024-01-20') },
  { id: 'schedule-2', name: '関東 資産運用プロモーション', branchScope: 'region', branchIds: [], region: '関東', daysOfWeek: [1, 2, 3, 4, 5], timeRange: '14:00-17:00', contentIds: ['content-4', 'content-5', 'content-6'], ruleType: 'rotation', status: 'running', approvedBy: 'user-2', createdAt: new Date('2024-01-21') },
  { id: 'schedule-3', name: '東京中央 夕方特別配信', branchScope: 'branch', branchIds: ['branch-1'], daysOfWeek: [1, 2, 3, 4, 5], timeRange: '17:00-19:00', contentIds: ['content-1', 'content-4'], ruleType: 'priority', status: 'running', approvedBy: 'user-2', createdAt: new Date('2024-01-22') },
  { id: 'schedule-4', name: '関西 高齢者向け相続セミナー', branchScope: 'region', branchIds: [], region: '関西', daysOfWeek: [2, 4], timeRange: '10:00-15:00', contentIds: ['content-7'], ruleType: 'fixed', status: 'pending', createdAt: new Date('2024-01-23') },
  { id: 'schedule-5', name: '全国 週末キャンペーン', branchScope: 'all', branchIds: [], daysOfWeek: [6, 0], timeRange: '10:00-16:00', contentIds: ['content-11', 'content-12'], ruleType: 'rotation', status: 'draft', createdAt: new Date('2024-01-24') },
];

const topicList: Lead['topic'][] = ['mortgage', 'asset_management', 'inheritance', 'corporate', 'other'];
const stageList: Lead['stage'][] = ['consult', 'proposal', 'application', 'contract', 'lost'];
const sourceList: Lead['source'][] = ['walk_in', 'signage', 'reservation', 'referral', 'other'];
const amountList: Lead['amountRange'][] = ['under_1m', 'under_5m', 'under_10m', 'over_10m'];

export const leads: Lead[] = Array.from({ length: 50 }, (_, i) => {
  const branchIndex = i % 10;
  const topic = topicList[i % 5];
  const stage = stageList[Math.floor(i / 10) % 5];
  const source = sourceList[i % 5];
  const daysAgo = Math.floor(Math.random() * 30);
  
  return {
    id: `lead-${i + 1}`,
    branchId: branches[branchIndex].id,
    createdByUserId: users[(i % 6) + 2].id,
    assignedToUserId: users[(i % 6) + 2].id,
    customerType: i % 3 === 0 ? 'new' : 'existing',
    topic,
    stage,
    amountRange: amountList[i % 4],
    source,
    relatedContentId: source === 'signage' ? contents[i % 20].id : undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * Math.max(0, daysAgo - 2)),
    notes: i % 3 === 0 ? 'お客様から追加資料の依頼あり' : undefined,
  };
});

export const kpiDaily: KpiDaily[] = branches.flatMap((branch) =>
  Array.from({ length: 30 }, (_, dayIndex) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - dayIndex));
    const baseWalkIn = branch.branchType === 'large' ? 80 : branch.branchType === 'consultation' ? 40 : 20;
    const variance = () => Math.floor(Math.random() * 20) - 10;
    const walkIn = Math.max(5, baseWalkIn + variance());
    const consultRate = 0.15 + Math.random() * 0.1;
    const proposalRate = 0.4 + Math.random() * 0.2;
    const contractRate = 0.3 + Math.random() * 0.2;
    
    const consultCount = Math.floor(walkIn * consultRate);
    const proposalCount = Math.floor(consultCount * proposalRate);
    const contractCount = Math.floor(proposalCount * contractRate);
    
    return {
      id: `kpi-${branch.id}-${dayIndex}`,
      branchId: branch.id,
      date,
      walkInCount: walkIn,
      consultCount,
      proposalCount,
      contractCount,
      sfaCreatedCount: Math.floor(consultCount * 0.8),
      signageImpressions: walkIn * branch.signageDevicesCount * 3,
      signageEngagements: Math.floor(walkIn * 0.1),
    };
  })
);

// Notifications dummy data
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: '新しい配信計画が承認待ちです',
    message: '「関西 高齢者向け相続セミナー」の配信計画が承認を待っています。確認してください。',
    type: 'warning',
    category: 'schedule',
    isRead: false,
    readByUserIds: [],
    createdBy: 'user-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'notif-2',
    title: '札幌支店でデバイスがオフラインです',
    message: 'エントランスのサイネージデバイスが30時間以上オフラインです。確認が必要です。',
    type: 'urgent',
    category: 'system',
    targetBranchIds: ['branch-8'],
    isRead: false,
    readByUserIds: [],
    createdBy: 'system',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'notif-3',
    title: '今週のKPI速報',
    message: '全店舗合計で相談数が先週比+12%を達成しました。',
    type: 'success',
    category: 'kpi',
    isRead: false,
    readByUserIds: ['user-2'],
    createdBy: 'system',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 'notif-4',
    title: '【重要】年末年始の配信スケジュールについて',
    message: '12/29〜1/3は特別配信スケジュールに切り替わります。詳細は管理画面を確認してください。',
    type: 'info',
    category: 'announcement',
    isRead: true,
    readByUserIds: ['user-1'],
    createdBy: 'user-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'notif-5',
    title: '東京中央支店 目標達成おめでとうございます',
    message: '今月の成約目標を達成しました！',
    type: 'success',
    category: 'kpi',
    targetBranchIds: ['branch-1'],
    isRead: false,
    readByUserIds: [],
    createdBy: 'system',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
];

// Approval requests dummy data
export const approvalRequests: ApprovalRequest[] = [
  {
    id: 'approval-1',
    scheduleId: 'schedule-4',
    requestedBy: 'user-3',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'pending',
    comments: [
      {
        id: 'comment-1',
        userId: 'user-3',
        comment: '関西エリアの高齢者向けに相続セミナーの告知を配信したいです。',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
    revisionCount: 0,
  },
  {
    id: 'approval-2',
    scheduleId: 'schedule-5',
    requestedBy: 'user-5',
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'revision_requested',
    comments: [
      {
        id: 'comment-2',
        userId: 'user-5',
        comment: '週末キャンペーンの配信計画です。',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
      {
        id: 'comment-3',
        userId: 'user-1',
        comment: '時間帯を午前中に変更してください。',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      },
    ],
    revisionCount: 1,
  },
];

// Customer reactions dummy data
const reactionTypes: ReactionType[] = ['interested', 'question', 'positive', 'negative', 'pamphlet_taken'];

export const customerReactions: CustomerReaction[] = Array.from({ length: 100 }, (_, i) => {
  const branchIndex = i % 10;
  const branch = branches[branchIndex];
  const deviceIndex = i % branch.signageDevicesCount;
  const hoursAgo = Math.floor(Math.random() * 72);
  
  return {
    id: `reaction-${i + 1}`,
    branchId: branch.id,
    deviceId: `device-${branch.id}-${deviceIndex + 1}`,
    contentId: contents[i % 20].id,
    reactionType: reactionTypes[i % 5],
    notes: i % 4 === 0 ? '詳細説明を求められた' : undefined,
    recordedBy: users[(i % 6) + 2].id,
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo),
  };
});

// KPI targets
export const kpiTargets: KpiTarget[] = branches.flatMap(branch => {
  const now = new Date();
  return [-1, 0, 1].map(monthOffset => {
    const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const baseTarget = branch.branchType === 'large' ? 100 : branch.branchType === 'consultation' ? 50 : 25;
    
    return {
      id: `target-${branch.id}-${month}`,
      branchId: branch.id,
      month,
      targetConsult: baseTarget,
      targetProposal: Math.floor(baseTarget * 0.5),
      targetContract: Math.floor(baseTarget * 0.2),
    };
  });
});

// Helper functions
export const getBranchById = (id: string) => branches.find(b => b.id === id);
export const getDevicesByBranchId = (branchId: string) => signageDevices.filter(d => d.branchId === branchId);
export const getLeadsByBranchId = (branchId: string) => leads.filter(l => l.branchId === branchId);
export const getKpiByBranchId = (branchId: string) => kpiDaily.filter(k => k.branchId === branchId);
export const getContentById = (id: string) => contents.find(c => c.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getSchedulesByBranchId = (branchId: string) => {
  const branch = getBranchById(branchId);
  if (!branch) return [];
  return schedules.filter(s => 
    s.branchScope === 'all' || 
    (s.branchScope === 'region' && s.region === branch.region) ||
    (s.branchScope === 'branch' && s.branchIds.includes(branchId))
  );
};

export const getNotificationsForUser = (userId: string, branchId?: string) => {
  return notifications.filter(n => {
    if (n.targetBranchIds && n.targetBranchIds.length > 0) {
      if (!branchId || !n.targetBranchIds.includes(branchId)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getUnreadNotificationCount = (userId: string) => {
  return notifications.filter(n => !n.readByUserIds.includes(userId) && !n.isRead).length;
};

export const getApprovalRequestByScheduleId = (scheduleId: string) => {
  return approvalRequests.find(a => a.scheduleId === scheduleId);
};

export const getPendingApprovals = () => {
  return approvalRequests.filter(a => a.status === 'pending');
};

export const getReactionsByBranchId = (branchId: string) => {
  return customerReactions.filter(r => r.branchId === branchId);
};

export const getReactionsByContentId = (contentId: string) => {
  return customerReactions.filter(r => r.contentId === contentId);
};

export const getKpiTargetByBranchAndMonth = (branchId: string, month: string) => {
  return kpiTargets.find(t => t.branchId === branchId && t.month === month);
};

export const getTodayKpi = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return kpiDaily.filter(k => {
    const kpiDate = new Date(k.date);
    kpiDate.setHours(0, 0, 0, 0);
    return kpiDate.getTime() === today.getTime();
  });
};

export const getKpiSummary = (days: number = 1) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  
  const relevantKpi = kpiDaily.filter(k => new Date(k.date) >= cutoff);
  
  return {
    totalConsult: relevantKpi.reduce((sum, k) => sum + k.consultCount, 0),
    totalProposal: relevantKpi.reduce((sum, k) => sum + k.proposalCount, 0),
    totalContract: relevantKpi.reduce((sum, k) => sum + k.contractCount, 0),
    totalSfaCreated: relevantKpi.reduce((sum, k) => sum + k.sfaCreatedCount, 0),
    totalWalkIn: relevantKpi.reduce((sum, k) => sum + k.walkInCount, 0),
  };
};

export const categoryLabels: Record<Content['category'], string> = {
  mortgage: '住宅ローン',
  asset_management: '資産運用',
  account: '口座開設',
  campaign: 'キャンペーン',
};

export const topicLabels: Record<Lead['topic'], string> = {
  mortgage: '住宅ローン',
  asset_management: '資産運用',
  inheritance: '相続',
  corporate: '法人',
  other: 'その他',
};

export const stageLabels: Record<Lead['stage'], string> = {
  consult: '相談',
  proposal: '提案',
  application: '申込',
  contract: '成約',
  lost: '失注',
};

export const sourceLabels: Record<Lead['source'], string> = {
  walk_in: '来店',
  signage: 'サイネージ',
  reservation: '予約',
  referral: '紹介',
  other: 'その他',
};

export const amountLabels: Record<Lead['amountRange'], string> = {
  under_1m: '〜100万',
  under_5m: '〜500万',
  under_10m: '〜1000万',
  over_10m: '1000万+',
};

export const roleLabels: Record<UserRole, string> = {
  admin: '管理者',
  hq_manager: '本部管理者',
  branch_manager: '支店長',
  staff: 'スタッフ',
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  info: '情報',
  warning: '注意',
  urgent: '緊急',
  success: '完了',
};

export const notificationCategoryLabels: Record<NotificationCategory, string> = {
  system: 'システム',
  schedule: '配信計画',
  kpi: 'KPI',
  announcement: 'お知らせ',
};

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: '承認待ち',
  approved: '承認済み',
  rejected: '却下',
  revision_requested: '修正依頼',
};

export const reactionTypeLabels: Record<ReactionType, string> = {
  interested: '興味あり',
  question: '質問',
  positive: '好反応',
  negative: '否定的',
  pamphlet_taken: 'パンフレット取得',
};
