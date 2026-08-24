import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCw,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Zap,
  Server,
  Cloud,
  Layers,
  ArrowRight
} from 'lucide-react';
import { deployEngine } from '../services/deployEngine';
import { User } from '../types/deployflow';

interface AuthScreenProps {
  onAuthSuccess: (user: User, message: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Sign In state - Pre-populated with local storage admin account for immediate access
  const [loginIdentifier, setLoginIdentifier] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Admin@123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random 5-character alphanumeric captcha
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaInput('');
    setError(null);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, [mode]);

  // Draw distorted graphical CAPTCHA on HTML Canvas
  useEffect(() => {
    if (!canvasRef.current || !generatedCaptcha || mode !== 'register') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 160;
    const height = 46;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Background noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 + Math.random() * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    ctx.textBaseline = 'middle';
    const charSpacing = width / (generatedCaptcha.length + 1);

    for (let i = 0; i < generatedCaptcha.length; i++) {
      const char = generatedCaptcha[i];
      ctx.save();
      const x = (i + 0.8) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${22 + Math.floor(Math.random() * 4)}px monospace`;
      const colors = ['#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#5eead4'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -8, 0);

      ctx.restore();
    }

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [generatedCaptcha, mode]);

  // Password constraints validation
  const isMinLength = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);

  const passedConstraintsCount = [isMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isPasswordValid = passedConstraintsCount === 5;

  const isUsernameAvailable = regUsername.trim().length >= 3 ? deployEngine.isUsernameAvailable(regUsername) : null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await deployEngine.login(loginIdentifier, loginPassword);
      setIsLoading(false);

      if (res.success && res.user) {
        onAuthSuccess(res.user, res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
    }
  };

  const handleQuickAdminLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await deployEngine.login('admin', 'Admin@123');
      setIsLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user, res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Please fulfill all password security constraints.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== generatedCaptcha.toUpperCase()) {
      setError('Incorrect CAPTCHA verification code. Please try again.');
      generateNewCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await deployEngine.register({
        email: regEmail,
        username: regUsername,
        password: regPassword,
        captchaInput,
        actualCaptcha: generatedCaptcha
      });
      setIsLoading(false);

      if (res.success && res.user) {
        onAuthSuccess(res.user, res.message);
      } else {
        setError(res.message);
        generateNewCaptcha();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Registration failed');
      generateNewCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 text-zinc-100">
      {/* Platform Branding Header */}
      <div className="w-full max-w-md text-center mb-8 space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xl">
          <Cloud className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">DeployFlow</h1>
          <p className="text-xs text-zinc-400 mt-1">
            AWS EC2 & Docker Hub Deployment Engine
          </p>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-950/60 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-3.5 text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/70 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setMode('register');
              setError(null);
              generateNewCaptcha();
            }}
            className={`py-3.5 text-center border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-emerald-500 text-emerald-400 bg-zinc-900/70 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Username or Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Admin@123"
                    required
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="developer@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  {isUsernameAvailable === true && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" /> Available
                    </span>
                  )}
                </div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="dev_user"
                    required
                    minLength={3}
                    maxLength={24}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-9 pr-9 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password constraints checklist */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px] bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 font-mono">
                  <span className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Min 8 chars
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Number (0-9)
                  </span>
                  <span className={`col-span-2 flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3 h-3" /> Special symbol (!@#$%^&*)
                  </span>
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Security Verification <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateNewCaptcha}
                    className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 p-1 shrink-0">
                    <canvas ref={canvasRef} className="block rounded-lg select-none" />
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="Code"
                    maxLength={5}
                    required
                    className="w-full py-2.5 px-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono tracking-widest uppercase transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid}
                className="w-full py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
