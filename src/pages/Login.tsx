import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('ログインしました');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-container p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-primary text-white shadow-2xl shadow-primary/40 mb-6 animate-bounce-soft">
            <span className="text-2xl font-bold">BX</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">BX Control</h1>
          <p className="text-muted-foreground mt-2">店舗改革統合プラットフォーム</p>
        </div>

        <Card className="glass-card border-white/20 animate-slide-up">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">ログイン</CardTitle>
            <CardDescription>アカウント情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-primary/30" 
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-pulse">ログイン中...</span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    ログイン
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm">
                <Sparkles className="h-4 w-4" />
                デモ用：任意の情報でログイン可能
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
          © 2024 BX Control. All rights reserved.
        </p>
      </div>
    </div>
  );
}
