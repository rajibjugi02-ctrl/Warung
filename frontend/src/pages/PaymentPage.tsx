import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Smartphone,
  Building,
  Wallet,
  Zap,
  Download,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { Order, Payment } from '../types';
import { formatRupiah, formatDate } from '../utils/format';
import { useToast } from '../contexts/ToastContext';

type StatusType = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const confettiTriggered = useRef(false);

  const fetchStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const [orderRes, payRes] = await Promise.all([
        api.get(`/orders/${orderId}`),
        api.get(`/payments/${orderId}/status`),
      ]);
      const orderData: Order = orderRes.data.data;
      const payData: Payment = payRes.data.data;
      setOrder(orderData);
      setPayment(payData);

      // Compute time left
      if (payData?.expiredAt) {
        const msLeft = new Date(payData.expiredAt).getTime() - Date.now();
        setTimeLeft(Math.max(0, Math.floor(msLeft / 1000)));
      }

      // Stop polling once paid or terminal
      if (payData?.status === 'PAID') {
        if (!confettiTriggered.current) {
          confettiTriggered.current = true;
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        if (pollInterval.current) clearInterval(pollInterval.current);
      } else if (['FAILED', 'EXPIRED'].includes(payData?.status)) {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }

      return payData?.status;
    } catch {
      // ignore
    }
  }, [orderId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchStatus();
      setLoading(false);
    };
    init();

    // Poll every 3.5 seconds for real-time status update
    pollInterval.current = setInterval(() => {
      fetchStatus();
    }, 3500);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [fetchStatus]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSimulateSuccess = async () => {
    if (!orderId) return;
    setSimulating(true);
    try {
      await api.post('/payments/simulate-success', { orderId });
      showToast('Simulasi pembayaran berhasil! Memperbarui status...', 'success');
      setTimeout(() => fetchStatus(), 1000);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Simulasi gagal.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-warung-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-warung-900 font-bold text-sm">Memuat instruksi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!order || !payment) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-card max-w-md w-full">
          <div className="text-5xl mb-4">🍱</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-stone-500 text-xs mb-6">Pastikan link pesanan Anda sudah benar.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-warung-800 text-white font-bold text-xs rounded-2xl shadow-sm"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const status = payment.status as StatusType;
  const isPaid = status === 'PAID';
  const isFailed = status === 'FAILED' || status === 'EXPIRED';
  const isPending = status === 'PENDING';

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-12 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Status Header */}
        <div
          className={`rounded-3xl p-8 mb-6 text-center shadow-floating border transition-all duration-300 ${
            isPaid
              ? 'bg-gradient-to-br from-warung-900 via-warung-800 to-warung-900 text-white border-warung-700'
              : isFailed
              ? 'bg-gradient-to-br from-rose-900 to-rose-800 text-white border-rose-700'
              : 'bg-gradient-to-br from-amber-700 via-amber-600 to-amber-700 text-white border-amber-500'
          }`}
        >
          <div className="flex justify-center mb-4">
            {isPaid ? (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner animate-scale-up">
                <CheckCircle2 className="w-10 h-10 text-emerald-300" />
              </div>
            ) : isFailed ? (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-rose-300" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center animate-pulse-glow">
                <Clock className="w-10 h-10 text-amber-200" />
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            {isPaid
              ? 'Pembayaran Berhasil! 🎉'
              : isFailed
              ? 'Pembayaran Kedaluwarsa'
              : 'Menunggu Pembayaran'}
          </h1>
          <p className="text-white/85 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {isPaid
              ? 'Terima kasih! Pesanan Anda segera disiapkan oleh tim Warung Lenira.'
              : isFailed
              ? 'Waktu pembayaran telah habis. Silakan buat pesanan baru.'
              : 'Silakan lakukan scan atau transfer sesuai nominal tepat di bawah ini.'}
          </p>

          {/* Countdown for PENDING */}
          {isPending && timeLeft > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/20 shadow-xs">
              <Clock className="w-4 h-4 text-white" />
              <span className="font-mono font-bold text-lg text-white">{formatTime(timeLeft)}</span>
              <span className="text-white/80 text-xs font-medium">tersisa</span>
            </div>
          )}
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 mb-5">
          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Nomor Pesanan</div>
              <div className="font-extrabold text-stone-900">{order.orderNumber}</div>
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Total Tagihan</div>
              <div className="font-black text-warung-900 text-base sm:text-lg">{formatRupiah(order.totalAmount)}</div>
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Metode Bayar</div>
              <div className="font-bold text-stone-800">{payment.method.replace('_VA', ' Virtual Account').replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">Waktu Pemesanan</div>
              <div className="font-semibold text-stone-700">{formatDate(order.createdAt)}</div>
            </div>
            {isPaid && payment.paidAt && (
              <div className="col-span-2 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-stone-500 font-medium">Lunas pada:</span>
                <span className="font-bold text-warung-800">{formatDate(payment.paidAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions for PENDING */}
        {isPending && (
          <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sm:p-8 mb-5">
            <h2 className="font-extrabold text-stone-900 mb-5 flex items-center gap-2 text-base sm:text-lg border-b border-stone-100 pb-3">
              {payment.method === 'QRIS' ? (
                <><Smartphone className="w-5 h-5 text-warung-700" /> Scan QRIS Resmi Toko</>
              ) : payment.method.endsWith('_VA') ? (
                <><Building className="w-5 h-5 text-warung-700" /> Transfer Virtual Account</>
              ) : (
                <><Wallet className="w-5 h-5 text-warung-700" /> Pembayaran E-Wallet Langsung</>
              )}
            </h2>

            {/* QRIS Frame */}
            {payment.method === 'QRIS' && payment.qrisImageUrl && (
              <div className="flex flex-col items-center">
                <div className="relative bg-white rounded-3xl p-5 border-2 border-stone-200 shadow-soft mb-4 group">
                  {/* QR Scan Corners */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-warung-700 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-warung-700 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-warung-700 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-warung-700 rounded-br-lg" />

                  <img
                    src={payment.qrisImageUrl}
                    alt="QRIS Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <a
                    href={payment.qrisImageUrl}
                    download={`QRIS-Lenira-${order.orderNumber}.png`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Simpan Gambar QR
                  </a>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 text-center mb-3 leading-relaxed max-w-sm">
                  Scan kode QR di atas menggunakan aplikasi <strong>GoPay, OVO, Dana, ShopeePay, BCA</strong>, atau Mobile Banking lainnya.
                </p>
                <div className="inline-flex items-center gap-1 text-xs text-warung-800 font-bold bg-warung-50 px-3 py-1.5 rounded-full border border-warung-200">
                  <ShieldCheck className="w-4 h-4 text-warung-700" />
                  <span>Verifikasi Otomatis Tanpa Upload Bukti</span>
                </div>
              </div>
            )}

            {/* Virtual Account */}
            {payment.method.endsWith('_VA') && payment.vaNumber && (
              <div className="space-y-4">
                <div className="bg-cream-50 rounded-2xl p-5 border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-stone-400 mb-1">Nomor Virtual Account {payment.bankName}</div>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-warung-900 tracking-wider">
                        {payment.vaNumber}
                      </div>
                    </div>
                    <button
                      onClick={() => copyText(payment.vaNumber!)}
                      className="p-3 bg-warung-100 hover:bg-warung-200 rounded-2xl transition-all text-warung-800 shadow-xs"
                      title="Salin Nomor VA"
                    >
                      {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <span>⚡</span>
                  <span>Transfer tepat sesuai nominal: <strong>{formatRupiah(payment.amount)}</strong></span>
                </div>
                <ol className="space-y-2 text-xs text-stone-600 pt-2">
                  <li className="flex gap-2"><span className="font-bold text-warung-800">1.</span> Buka aplikasi M-Banking atau ATM {payment.bankName}</li>
                  <li className="flex gap-2"><span className="font-bold text-warung-800">2.</span> Pilih menu Transfer &gt; Virtual Account</li>
                  <li className="flex gap-2"><span className="font-bold text-warung-800">3.</span> Masukkan nomor Virtual Account di atas</li>
                  <li className="flex gap-2"><span className="font-bold text-warung-800">4.</span> Konfirmasi dan selesaikan transaksi</li>
                </ol>
              </div>
            )}

            {/* E-Wallet */}
            {(payment.method === 'GOPAY' || payment.method === 'SHOPEEPAY') && payment.qrisImageUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-card">
                  <img src={payment.qrisImageUrl} alt="E-Wallet QR" className="w-48 h-48 object-contain" />
                </div>
                {payment.paymentUrl && (
                  <a
                    href={payment.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka Aplikasi {payment.method === 'GOPAY' ? 'GoPay' : 'ShopeePay'}
                  </a>
                )}
              </div>
            )}

            {/* Sandbox Simulate Button */}
            <div className="mt-8 pt-5 border-t border-stone-100">
              <button
                onClick={handleSimulateSuccess}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm disabled:opacity-60 active:scale-98"
              >
                {simulating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Memproses Verifikasi...</>
                ) : (
                  <><Zap className="w-4 h-4 text-amber-400" /> 🧪 Simulasi Selesaikan Pembayaran (Test Mode)</>
                )}
              </button>
              <p className="text-[11px] text-stone-400 text-center mt-2">
                Tombol simulasi ini aktif untuk memudahkan pengujian di mode development.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isPaid && (
            <>
              <Link
                to={`/pesanan/${order.id}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                Lacak Status Pesanan
              </Link>
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-cream-100 border border-stone-200 text-stone-700 hover:text-stone-900 font-bold text-xs rounded-2xl transition-all shadow-2xs active:scale-95 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 group-hover:-translate-x-1 transition-transform" />
                <span>Kembali ke Beranda</span>
              </Link>
            </>
          )}
          {isFailed && (
            <>
              <Link
                to={`/checkout`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                Coba Pesan Ulang
              </Link>
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-cream-100 border border-stone-200 text-stone-700 hover:text-stone-900 font-bold text-xs rounded-2xl transition-all shadow-2xs active:scale-95 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 group-hover:-translate-x-1 transition-transform" />
                <span>Kembali ke Beranda</span>
              </Link>
            </>
          )}
          {isPending && (
            <button
              onClick={() => fetchStatus()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-stone-200 text-stone-700 hover:bg-cream-50 text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              Perbarui Status Pembayaran
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
