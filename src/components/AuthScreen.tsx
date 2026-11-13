import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

 const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage(
          'Account created. Check your email if confirmation is required.'
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B16] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Rawls <span className="text-blue-500">&</span> Hub
          </h1>
          <p className="text-slate-400 mt-2">
            SmartMerchant AI
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-2">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>

        <p className="text-sm text-slate-400 mb-6">
          {isLogin
            ? 'Sign in to access your business dashboard.'
            : 'Register to start managing your business.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-3 font-semibold"
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-blue-300">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-slate-400 mt-6">
          {isLogin ? "Don't have an account?" : 'Already registered?'}
          {' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
            }}
            className="text-blue-400 hover:text-blue-300"
          >
            {isLogin ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
