import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Store, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AuthPageProps {
  mode: 'login' | 'register';
}

interface InputFieldProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  action?: React.ReactNode;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  action,
  autoComplete,
}) => (
  <div className="relative">
    <Icon
      className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
      style={{ width: 18, height: 18 }}
    />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={autoComplete}
      className="w-full pl-11 pr-11 py-3.5 bg-stone-50 border border-stone-200/90 rounded-2xl text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all shadow-2xs"
    />
    {action && (
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
        {action}
      </div>
    )}
  </div>
);

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && form.password !== form.confirmPassword) {
      showToast('Password dan konfirmasi password tidak cocok.', 'error');
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, phone: form.phone, password: form.password };

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        showToast(
          mode === 'login' ? 'Selamat datang kembali! 👋' : 'Akun berhasil didaftarkan! 🎉',
          'success'
        );
        const isAdmin = res.data.data.user.role === 'ADMIN';
        navigate(isAdmin ? '/admin' : '/');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memproses. Periksa kembali data Anda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 relative overflow-hidden animate-fade-in">
      {/* Background ambient accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-warung-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Modern Interactive Back Button */}
        <div className="flex justify-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-cream-100 border border-stone-200 text-stone-700 hover:text-stone-950 font-bold text-xs rounded-full shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-500 group-hover:text-warung-800 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-warung-800 to-warung-950 text-white rounded-3xl flex items-center justify-center shadow-card mb-2.5 border border-warung-700/50 transform hover:rotate-3 transition-transform">
            <Store className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-warung-950 text-xl tracking-tight leading-none">
            Warung Lenira
          </span>
          <span className="text-[11px] text-stone-500 mt-1 font-medium">Jajanan & Camilan Segar Pilihan</span>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-card backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {mode === 'login'
                ? 'Silakan masukkan email dan password untuk melanjutkan belanja.'
                : 'Lengkapi data di bawah untuk menikmati kemudahan transaksi.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <InputField
                  icon={User}
                  placeholder="Nama Lengkap"
                  value={form.name}
                  onChange={(v) => updateForm('name', v)}
                  autoComplete="name"
                  required
                />
                <InputField
                  icon={Phone}
                  type="tel"
                  placeholder="Nomor WhatsApp (cth: 081234567890)"
                  value={form.phone}
                  onChange={(v) => updateForm('phone', v)}
                  autoComplete="tel"
                  required
                />
              </>
            )}

            <InputField
              icon={Mail}
              type="email"
              placeholder="Alamat Email"
              value={form.email}
              onChange={(v) => updateForm('email', v)}
              autoComplete="email"
              required
            />

            <InputField
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Kata Sandi / Password"
              value={form.password}
              onChange={(v) => updateForm('password', v)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              action={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-700 p-1 transition-colors"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {mode === 'register' && (
              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Konfirmasi Kata Sandi"
                value={form.confirmPassword}
                onChange={(v) => updateForm('confirmPassword', v)}
                autoComplete="new-password"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : mode === 'login' ? (
                'Masuk Sekarang'
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Mode Switch Link */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs">
            {mode === 'login' ? (
              <span className="text-stone-600">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-extrabold text-warung-800 hover:text-warung-900 underline ml-1"
                >
                  Daftar Gratis
                </Link>
              </span>
            ) : (
              <span className="text-stone-600">
                Sudah memiliki akun?{' '}
                <Link
                  to="/login"
                  className="font-extrabold text-warung-800 hover:text-warung-900 underline ml-1"
                >
                  Masuk di Sini
                </Link>
              </span>
            )}
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-stone-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-warung-700" />
          <span>Data login Anda dienkripsi dan terlindungi aman</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
