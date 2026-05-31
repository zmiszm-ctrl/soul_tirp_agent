import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, register, logout } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码');
      return;
    }

    if (isLogin) {
      const result = await login(username.trim(), password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } else {
      const result = await register(username.trim(), password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(result.message);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setSuccess('已退出登录');
  };

  return (
    <div className="min-h-[100svh] bg-bg-primary flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 px-4 py-4"
      >
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-title font-serif-zh text-text-primary">
          {user ? '个人中心' : isLogin ? '登录' : '注册'}
        </h1>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {user ? (
          /* Logged in state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[360px] text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-serif-zh text-accent-green">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <h2 className="text-title font-serif-zh text-text-primary mb-2">{user.username}</h2>
            <p className="text-caption text-text-secondary mb-8">欢迎回来</p>
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-pill border border-text-secondary/30 text-text-secondary text-body font-sans-zh hover:bg-text-secondary/10 transition-colors"
            >
              退出登录
            </button>
          </motion.div>
        ) : (
          /* Login/Register form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[360px]"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-blue">
                  <path d="M3 21l9-18 9 18H3z" />
                </svg>
              </div>
              <h2 className="text-title font-serif-zh text-text-primary">
                {isLogin ? '欢迎回来' : '创建账号'}
              </h2>
              <p className="text-caption text-text-secondary mt-2">
                {isLogin ? '登录后享受更多功能' : '开启你的放空之旅'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-caption text-text-secondary mb-2">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-3 rounded-card bg-bg-secondary border border-line-soft text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-caption text-text-secondary mb-2">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 pr-12 rounded-card bg-bg-secondary border border-line-soft text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-card px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-amber-800">
                      密码请妥善保存，如若遗失，无法找回
                    </p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-card px-4 py-3"
                >
                  <p className="text-[12px] text-red-800">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-50 border border-green-200 rounded-card px-4 py-3"
                >
                  <p className="text-[12px] text-green-800">{success}</p>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-pill bg-text-primary text-white text-body font-sans-zh font-medium hover:bg-text-primary/90 active:scale-[0.98] transition-all duration-300 shadow-soft"
              >
                {isLogin ? '登录' : '注册'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-caption text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/')}
                className="text-caption text-text-secondary hover:text-text-primary transition-colors"
              >
                跳过，先体验一下
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
