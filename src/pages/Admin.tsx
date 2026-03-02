import { useState } from 'react';
import { Users, Building2, Tag, Settings, Shield } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { users, branches, roleLabels, getBranchById } from '@/lib/dummyData';

export default function Admin() {
  const [userSearch, setUserSearch] = useState('');
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">管理</h1>
            <p className="text-sm text-muted-foreground mt-1">ユーザー・店舗・権限の管理</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              ユーザー
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="h-4 w-4" />
              店舗
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              権限
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              設定
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <Input
                placeholder="ユーザーを検索..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button>新規ユーザー追加</Button>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名前</th>
                    <th>メール</th>
                    <th>権限</th>
                    <th>所属店舗</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const branch = user.branchId ? getBranchById(user.branchId) : null;
                    return (
                      <tr key={user.id}>
                        <td className="font-medium">{user.name}</td>
                        <td className="text-muted-foreground">{user.email}</td>
                        <td>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {roleLabels[user.role]}
                          </Badge>
                        </td>
                        <td>{branch?.name || '-'}</td>
                        <td>
                          <Button variant="ghost" size="sm">編集</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{branches.length}店舗登録済み</p>
              <Button>新規店舗追加</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map(branch => (
                <Card key={branch.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">地域</span>
                        <span>{branch.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">タイプ</span>
                        <Badge variant="outline">
                          {branch.branchType === 'large' ? '大型' : branch.branchType === 'consultation' ? '相談特化' : '小型'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">サイネージ</span>
                        <span>{branch.signageDevicesCount}台</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1">
                          {branch.targetSegments.map(seg => (
                            <Badge key={seg} variant="secondary" className="text-xs">{seg}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge>Admin</Badge>
                    管理者
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ 全データ閲覧/編集</li>
                    <li>✓ 店舗マスタ、ユーザー、権限管理</li>
                    <li>✓ KPI定義設定</li>
                    <li>✓ テンプレート管理</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">HQ Manager</Badge>
                    本部管理者
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ 全店舗ダッシュボード閲覧</li>
                    <li>✓ サイネージ配信計画の作成/承認</li>
                    <li>✓ KPIレポート閲覧、エクスポート</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">Branch Manager</Badge>
                    支店長
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ 自店の状況閲覧</li>
                    <li>✓ 自店のサイネージ配信調整（時間帯変更等）</li>
                    <li>✓ 簡易SFAの確認・担当割当</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">Staff</Badge>
                    スタッフ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ 自分のSFA起票/更新</li>
                    <li>✓ 予約/相談記録入力</li>
                    <li>✓ サイネージの反応入力</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">KPI定義</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">相談</p>
                      <p className="text-sm text-muted-foreground">お客様との相談を開始した件数</p>
                    </div>
                    <Button variant="outline" size="sm">編集</Button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">提案</p>
                      <p className="text-sm text-muted-foreground">具体的な商品・サービスを提案した件数</p>
                    </div>
                    <Button variant="outline" size="sm">編集</Button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">成約</p>
                      <p className="text-sm text-muted-foreground">契約・申込が完了した件数</p>
                    </div>
                    <Button variant="outline" size="sm">編集</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
