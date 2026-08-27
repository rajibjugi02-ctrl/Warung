import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  Upload,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  category: 'BANK' | 'EWALLET';
}

interface PaymentSettings {
  qrisImage: string;
  qrisMerchantName: string;
  qrisNmid: string;
  bankAccounts: BankAccount[];
  paymentInstructions: string;
}

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  qrisImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=00020101021126610014ID.LINKAJA.WWW0118936009110020150904021500000000000000051440014ID.CO.QRIS.WWW0215ID10200300400500303UME5204541153033605802ID5920WARUNG%20LENIRA6006BOGOR61051661063046BAA',
  qrisMerchantName: 'Warung Sembako & Jajanan Lenira',
  qrisNmid: 'ID1020030040050',
  bankAccounts: [
    {
      id: 'bank-bri-1',
      bankName: 'Bank BRI (Bank Rakyat Indonesia)',
      accountNumber: '0123-01-045678-50-9',
      accountHolder: 'Leni Herlina',
      isActive: true,
      category: 'BANK',
    },
    {
      id: 'bank-bca-1',
      bankName: 'Bank BCA (Bank Central Asia)',
      accountNumber: '8735-092-123',
      accountHolder: 'Leni Herlina',
      isActive: true,
      category: 'BANK',
    },
    {
      id: 'ewallet-dana-1',
      bankName: 'DANA / GoPay / OVO / ShopeePay',
      accountNumber: '0812-3456-7890',
      accountHolder: 'Leni Herlina (Warung Lenira)',
      isActive: true,
      category: 'EWALLET',
    },
  ],
  paymentInstructions: 'Silakan transfer tepat sesuai nominal yang tertera. Setelah transfer atau scan QRIS, konfirmasikan pesanan ke WhatsApp pemilik warung.',
};

const AdminPaymentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.data) {
        setSettings({
          ...DEFAULT_PAYMENT_SETTINGS,
          ...res.data.data,
          bankAccounts: res.data.data.bankAccounts || DEFAULT_PAYMENT_SETTINGS.bankAccounts,
        });
      }
    } catch {
      showToast('Gagal memuat pengaturan pembayaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG/PNG).', 'error');
      return;
    }

    setUploadingQr(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.post('/admin/upload', {
            image: base64Data,
            name: 'qris-toko-lenira',
          });
          if (res.data.success && res.data.data?.url) {
            setSettings((prev) => ({ ...prev, qrisImage: res.data.data.url }));
            showToast('Foto QRIS barcode berhasil diperbarui! 📸', 'success');
          }
        } catch {
          setSettings((prev) => ({ ...prev, qrisImage: base64Data }));
          showToast('Foto QRIS berhasil dimuat.', 'info');
        } finally {
          setUploadingQr(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Gagal memproses file QRIS.', 'error');
      setUploadingQr(false);
    }
  };

  const handleAddAccount = () => {
    const newAccount: BankAccount = {
      id: `acc-${Date.now()}`,
      bankName: 'Bank BRI / BCA / Mandiri',
      accountNumber: '',
      accountHolder: 'Leni Herlina',
      isActive: true,
      category: 'BANK',
    };
    setSettings((prev) => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAccount],
    }));
  };

  const handleUpdateAccount = (id: string, field: keyof BankAccount, value: any) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((acc) =>
        acc.id === id ? { ...acc, [field]: value } : acc
      ),
    }));
  };

  const handleDeleteAccount = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((acc) => acc.id !== id),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        showToast('Pengaturan pembayaran berhasil disimpan! 🎉', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Pengaturan Pembayaran Toko">
        <div className="space-y-4">
          <div className="h-40 bg-white rounded-3xl animate-pulse" />
          <div className="h-60 bg-white rounded-3xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan Pembayaran (QRIS & Rekening Transfer)">
      <div className="space-y-6 max-w-5xl">
        {/* Header Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl shadow-card border border-stone-200/80">
          <div>
            <h2 className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Kelola QRIS & Rekening Bank Pemilik Warung
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ganti foto barcode QRIS, atur nomor rekening BRI/BCA/E-Wallet, dan nama pemilik untuk pembayaran pembeli.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex-shrink-0"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
          </button>
        </div>

        {/* 1. Kelola QRIS Toko */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm sm:text-base">
              <QrCode className="w-5 h-5 text-warung-700" />
              <span>1. Barcode QRIS Resmi Toko</span>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Mendukung Semua E-Wallet & Mobile Banking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* QR Preview Frame */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative bg-stone-50 p-4 rounded-3xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center w-full max-w-[260px] aspect-square group shadow-inner">
                {settings.qrisImage ? (
                  <img
                    src={settings.qrisImage}
                    alt="QRIS Barcode"
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WARUNG_LENIRA';
                    }}
                  />
                ) : (
                  <div className="text-center text-stone-400 p-4">
                    <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <span className="text-xs font-semibold">Belum ada foto QRIS</span>
                  </div>
                )}

                {uploadingQr && (
                  <div className="absolute inset-0 bg-stone-950/60 rounded-3xl flex flex-col items-center justify-center text-white text-xs font-bold gap-2 backdrop-blur-xs">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <span>Mengunggah foto...</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingQr}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-warung-100 hover:bg-warung-200 text-warung-900 text-xs font-bold rounded-xl transition-all shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto Barcode QRIS Baru</span>
              </button>
            </div>

            {/* QR Info Fields */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Nama Merchant / Usaha QRIS:
                </label>
                <input
                  type="text"
                  value={settings.qrisMerchantName}
                  onChange={(e) => setSettings({ ...settings, qrisMerchantName: e.target.value })}
                  placeholder="WARUNG SEMBAKO & JAJANAN LENIRA"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Nomor NMID QRIS (Opsional):
                </label>
                <input
                  type="text"
                  value={settings.qrisNmid}
                  onChange={(e) => setSettings({ ...settings, qrisNmid: e.target.value })}
                  placeholder="ID1020030040050"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div className="bg-cream-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-stone-600 space-y-1.5">
                <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Petunjuk QRIS:</span>
                </div>
                <p>
                  Foto barcode yang Anda upload di sini akan langsung ditampilkan ke pembeli saat memilih metode <strong>QRIS</strong> pada halaman pembayaran.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kelola Rekening Transfer Bank & E-Wallet */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 font-black text-stone-900 text-sm sm:text-base">
              <Building className="w-5 h-5 text-warung-700" />
              <span>2. Daftar Rekening Transfer & E-Wallet Pemilik Warung</span>
            </div>
            <button
              type="button"
              onClick={handleAddAccount}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening / E-Wallet</span>
            </button>
          </div>

          <div className="space-y-4">
            {settings.bankAccounts.map((acc, index) => (
              <div
                key={acc.id}
                className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3 relative transition-all hover:border-warung-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    {acc.category === 'EWALLET' ? (
                      <Wallet className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Building className="w-4 h-4 text-blue-600" />
                    )}
                    Rekening #{index + 1} ({acc.bankName || 'Rekening Baru'})
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acc.isActive}
                        onChange={(e) => handleUpdateAccount(acc.id, 'isActive', e.target.checked)}
                        className="rounded border-stone-300 text-warung-600 focus:ring-warung-500 w-4 h-4"
                      />
                      <span>{acc.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Nama Bank / E-Wallet:
                    </label>
                    <input
                      type="text"
                      value={acc.bankName}
                      onChange={(e) => handleUpdateAccount(acc.id, 'bankName', e.target.value)}
                      placeholder="cth: Bank BRI / Bank BCA / DANA"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Nomor Rekening / No. HP:
                    </label>
                    <input
                      type="text"
                      value={acc.accountNumber}
                      onChange={(e) => handleUpdateAccount(acc.id, 'accountNumber', e.target.value)}
                      placeholder="cth: 0123-01-045678-50-9"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-warung-500 text-warung-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Atas Nama (Pemilik):
                    </label>
                    <input
                      type="text"
                      value={acc.accountHolder}
                      onChange={(e) => handleUpdateAccount(acc.id, 'accountHolder', e.target.value)}
                      placeholder="cth: Leni Herlina"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Catatan / Panduan Pembayaran */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-4">
          <div className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
            3. Petunjuk & Panduan Pembayaran Pembeli
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Pesan Konfirmasi / Instruksi:
            </label>
            <textarea
              rows={3}
              value={settings.paymentInstructions}
              onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
              placeholder="Tuliskan petunjuk transfer bagi pembeli..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 resize-none"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentSettingsPage;
