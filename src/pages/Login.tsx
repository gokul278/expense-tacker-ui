import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from '@phosphor-icons/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await client.post('/auth/login', { email, password });
      login(resp.data.token, resp.data.userId);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-6 text-bg">
            <ShieldCheck size={32} weight="duotone" />
          </div>
          <h1 className="text-4xl font-serif text-[#f0f0ee] tracking-tight">Welcome Back</h1>
          <p className="text-muted mt-3">Log in to your ExpenseIQ account</p>
        </div>

        <div className="bg-surface border border-white/5 rounded-3xl p-8 space-y-6">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-dim"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-dim"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-[#d4f57a] text-bg font-serif text-lg py-3.5 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent/10"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
