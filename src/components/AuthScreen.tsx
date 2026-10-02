import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import logoImage from 'figma:asset/21baad6507e62ba97c53b4e96400cc78fb54fe4c.png';
import { api, User } from '../lib/api';

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
  initialMode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onBack?: () => void;
}

export function AuthScreen({ onAuthenticated, initialMode = 'login', onModeChange, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = mode === 'login' ? await api.login(email, password) : await api.register(name, email, password);
      onAuthenticated(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'pb-input';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm pb-sheet p-7 md:p-9">
        <div className="flex flex-col items-center text-center mb-7">
          <img src={logoImage} alt="" className="w-14 h-14 object-contain mb-4" />
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            {mode === 'login' ? 'เข้าสู่ ProfitBloom' : 'สร้างบัญชี ProfitBloom'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">คำนวณต้นทุน กำไร และออกใบเสนอราคา</p>
        </div>

        <div className="flex bg-canvas rounded-full p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); onModeChange?.(m); }}
              className={`flex-1 px-3 py-2 text-sm rounded-full transition-colors ${
                mode === m ? 'bg-white text-ink shadow-card font-medium' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="pb-label">ชื่อ</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมใจ" required autoComplete="name" />
            </div>
          )}
          <div>
            <label className="pb-label">อีเมล</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required autoComplete="email" />
          </div>
          <div>
            <label className="pb-label">รหัสผ่าน</label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'อย่างน้อย 8 ตัวอักษร' : ''}
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-50 text-sm text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="pb-btn-primary w-full !py-3 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
          </button>
        </form>
      </div>
      {onBack && (
        <button onClick={onBack} className="absolute top-5 left-5 text-sm text-ink-muted hover:text-ink">
          ← กลับหน้าแรก
        </button>
      )}
    </div>
  );
}
