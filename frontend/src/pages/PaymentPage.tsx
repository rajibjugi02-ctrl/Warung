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
  Download,
  ArrowLeft,
  Wallet,
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

  const itemNames = (order.items || []).map((i) => `• ${i.productName}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity}`).join('\n');
  const waMsg = payment.method === 'CASH'
    ? `Halo Warung Lenira, saya ingin memesan produk berikut dan akan membayar tunai (cash) saat mengambilnya di warung:
📋 No. Pesanan: *${order.orderNumber}*
👤 Nama: *${order.customerName}*

📦 Produk yang dibeli:
${itemNames}

💰 Total Pembayaran: *${formatRupiah(order.totalAmount)}*
Mohon disiapkan ya, terima kasih!`
    : `Halo Warung Lenira, saya sudah melakukan pembayaran untuk pesanan:
📋 No. Pesanan: *${order.orderNumber}*
👤 Nama: *${order.customerName}*

📦 Produk yang dibeli:
${itemNames}

💰 Total Pembayaran: *${formatRupiah(order.totalAmount)}*
Mohon segera diproses ya, terima kasih!`;

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
            <h2 className="font-extrabold text-stone-900 mb-5 flex items-center justify-between text-base sm:text-lg border-b border-stone-100 pb-3">
              <span className="flex items-center gap-2">
                {payment.method === 'QRIS' ? (
                  <><Smartphone className="w-5 h-5 text-warung-700" /> Scan QRIS Resmi Toko</>
                ) : payment.method === 'CASH' ? (
                  <><Wallet className="w-5 h-5 text-warung-700" /> Pembayaran Tunai / Cash</>
                ) : (
                  <><Building className="w-5 h-5 text-warung-700" /> Transfer Bank & E-Wallet Toko</>
                )}
              </span>
              <span className="text-xs font-bold text-warung-800 bg-warung-50 px-3 py-1 rounded-full border border-warung-200 hidden sm:inline-block">
                Warung Lenira
              </span>
            </h2>

            {/* QRIS Frame */}
            {payment.method === 'QRIS' && (
              <div className="flex flex-col items-center">
                <div className="relative bg-white rounded-3xl p-3 sm:p-4 border-2 border-stone-200 shadow-soft mb-4 group max-w-xs w-full">
                  <img
                    src="/qris-warung-lenira.png"
                    alt="QRIS Resmi Warung Lenira"
                    className="w-full h-auto object-contain rounded-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = payment.qrisImageUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WARUNG_LENIRA';
                    }}
                  />
                </div>

                <div className="text-center mb-3">
                  <div className="text-base font-black text-stone-900 uppercase tracking-wide">
                    WARUNG LENIRA
                  </div>
                  <div className="text-xs font-bold text-stone-500 mt-0.5">NMID: ID1025399533997</div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <a
                    href="/qris-warung-lenira.png"
                    download={`QRIS-Warung-Lenira-${order.orderNumber}.png`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Simpan Gambar QR
                  </a>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 text-center mb-4 leading-relaxed max-w-sm">
                  Scan kode QR di atas menggunakan aplikasi <strong>GoPay, OVO, DANA, ShopeePay, BCA, BRImo, Livin</strong>, atau Mobile Banking lainnya.
                </p>
              </div>
            )}

            {/* Bank Transfer / VA Accounts List */}
            {payment.method !== 'QRIS' && payment.method !== 'CASH' && (
              <div className="space-y-4">
                <div className="text-xs text-stone-600 mb-2">
                  Silakan transfer ke salah satu rekening resmi pemilik Warung Lenira di bawah ini:
                </div>

                <div className="space-y-3">
                  {/* Bank BRI */}
                  <div className="bg-cream-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 hover:border-sky-400 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase text-sky-800 mb-0.5 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-sky-700" />
                          <span>Bank BRI</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-mono font-black text-stone-900 tracking-wider">
                          7222 01008732533
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Atas Nama: <strong className="text-stone-900 font-bold">Leni Herlina</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => copyText('722201008732533')}
                        className="p-3 bg-white hover:bg-sky-50 rounded-2xl transition-all text-sky-800 shadow-2xs border border-stone-200 flex-shrink-0"
                        title="Salin Nomor Rekening BRI"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bank BSI */}
                  <div className="bg-cream-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 hover:border-teal-400 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase text-teal-800 mb-0.5 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-teal-700" />
                          <span>Bank BSI (Bank Syariah Indonesia)</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-mono font-black text-stone-900 tracking-wider">
                          7367355818
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Atas Nama: <strong className="text-stone-900 font-bold">Leni Herlina</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => copyText('7367355818')}
                        className="p-3 bg-white hover:bg-teal-50 rounded-2xl transition-all text-teal-800 shadow-2xs border border-stone-200 flex-shrink-0"
                        title="Salin Nomor Rekening BSI"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Bank BCA */}
                  <div className="bg-cream-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200/80 hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase text-blue-800 mb-0.5 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-700" />
                          <span>Bank BCA</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-mono font-black text-stone-900 tracking-wider">
                          0954440491
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Atas Nama: <strong className="text-stone-900 font-bold">Leni Herlina</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => copyText('0954440491')}
                        className="p-3 bg-white hover:bg-blue-50 rounded-2xl transition-all text-blue-800 shadow-2xs border border-stone-200 flex-shrink-0"
                        title="Salin Nomor Rekening BCA"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 font-semibold flex items-center gap-2">
                  <span>⚡</span>
                  <span>Transfer tepat sesuai total tagihan: <strong className="text-stone-950">{formatRupiah(payment.amount)}</strong></span>
                </div>
              </div>
            )}

            {payment.method === 'CASH' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-250 shadow-2xs">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mb-2">Bayar Tunai di Warung</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Silakan lakukan pembayaran secara tunai (cash) langsung ke kasir Warung Lenira saat Anda mengambil pesanan Anda di warung.
                </p>
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 font-bold text-left max-w-md mx-auto">
                  💡 Mohon konfirmasikan pesanan Anda lewat WhatsApp dengan tombol di bawah agar segera disiapkan sebelum Anda datang ke warung.
                </div>
              </div>
            )}

            {/* WhatsApp Confirmation Button */}
            <div className="mt-5 pt-4 border-t border-stone-100">
              <a
                href={`https://wa.me/62895333691222?text=${encodeURIComponent(waMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-sm active:scale-98"
              >
                <span>{payment.method === 'CASH' ? 'Konfirmasi Pesanan via WhatsApp' : 'Kirim Bukti Pembayaran via WhatsApp'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>


          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {(isPaid || payment.method === 'CASH') && (
            <Link
              to={`/pesanan/${order.id}`}
              className="w-full flex items-center justify-center gap-2 py-4 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95"
            >
              Lacak Status Pesanan
            </Link>
          )}
          {isFailed && (
            <Link
              to={`/checkout`}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md active:scale-95"
            >
              Coba Pesan Ulang
            </Link>
          )}
          {isPending && payment.method !== 'CASH' && (
            <button
              onClick={() => fetchStatus()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-stone-200 text-stone-700 hover:bg-cream-50 text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              Perbarui Status Pembayaran
            </button>
          )}
          {isPending && payment.method === 'CASH' && (
            <button
              onClick={() => fetchStatus()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-stone-200 text-stone-700 hover:bg-cream-50 text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4 text-stone-500" />
              Cek Status Pembayaran Tunai
            </button>
          )}
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-cream-100 border border-stone-200 text-stone-700 hover:text-stone-900 font-bold text-xs rounded-2xl transition-all shadow-2xs active:scale-95 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
