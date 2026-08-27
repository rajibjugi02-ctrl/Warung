import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Upload, RefreshCw, Save } from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface HeroCardSetting {
  title: string;
  tag: string;
  image: string;
}

interface BannerSettings {
  storeName: string;
  storeTagline: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  heroCards: HeroCardSetting[];
}

const defaultData: BannerSettings = {
  storeName: 'Warung Sembako & Jajanan Lenira',
  storeTagline: 'Sembako Lengkap & Jajanan Nikmat Harian',
  heroBadge: 'Warung Sembako & Jajanan Resmi Lenira',
  heroTitle: 'Sembako Lengkap & Aneka Jajanan Pilihan.',
  heroTitleHighlight: 'Pesan Mudah dari Rumah.',
  heroSubtitle: 'Belanja kebutuhan pokok dapur, beras pulen, minyak goreng, telur segar, serta aneka jajanan basreng dan camilan renyah. Pembayaran instan via QRIS, pesan online dan tinggal datang ambil ke warung.',
  stat1Value: '100%',
  stat1Label: 'Bahan Pilihan',
  stat2Value: '4.9 ★',
  stat2Label: 'Ulasan Pelanggan',
  stat3Value: 'Instan',
  stat3Label: 'QRIS Otomatis',
  heroCards: [
    {
      title: 'Beras & Sembako',
      tag: 'Kebutuhan Pokok',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Minyak & Telur Segar',
      tag: 'Segar Harian',
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Basreng Daun Jeruk',
      tag: 'Terfavorit',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Camilan & Snack Gurih',
      tag: 'Camilan Gurih',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

const AdminBannerSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<BannerSettings>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null);
  const { showToast } = useToast();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setSettings({ ...defaultData, ...res.data.data });
        }
      } catch {
        showToast('Gagal memuat pengaturan toko.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleCardUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran foto terlalu besar. Maksimal 8MB.', 'error');
      return;
    }

    setUploadingCardIndex(index);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.post('/admin/upload', {
            image: base64Data,
            name: `banner-card-${index + 1}`,
          });
          if (res.data.success && res.data.data?.url) {
            const updatedCards = [...settings.heroCards];
            updatedCards[index] = { ...updatedCards[index], image: res.data.data.url };
            setSettings({ ...settings, heroCards: updatedCards });
            showToast(`Foto kartu #${index + 1} berhasil diunggah! 📸`, 'success');
          }
        } catch {
          const updatedCards = [...settings.heroCards];
          updatedCards[index] = { ...updatedCards[index], image: base64Data };
          setSettings({ ...settings, heroCards: updatedCards });
          showToast('Foto berhasil dimuat.', 'info');
        } finally {
          setUploadingCardIndex(null);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Gagal memproses file foto.', 'error');
      setUploadingCardIndex(null);
    }
  };

  const handleUpdateCardField = (index: number, field: keyof HeroCardSetting, value: string) => {
    const updatedCards = [...settings.heroCards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setSettings({ ...settings, heroCards: updatedCards });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.data.success) {
        showToast('Pengaturan banner & beranda berhasil disimpan! 🎉', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Pengaturan Banner Beranda">
        <div className="space-y-4">
          <div className="h-40 bg-white rounded-3xl animate-pulse" />
          <div className="h-60 bg-white rounded-3xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan Banner Beranda & Foto">
      <div className="space-y-6 max-w-5xl">
        {/* Header Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl shadow-card border border-stone-200/80">
          <div>
            <h2 className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Kelola Teks & 4 Foto Banner Beranda
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ubah tulisan promosi, judul sembako/jajanan, dan upload 4 foto makanan/sembako asli Anda.
            </p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex-shrink-0"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>

        {/* 1. Teks Headline Banner */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-4">
          <div className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
            1. Tulisan Utama Banner Beranda (Hero Banner)
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Teks Badge Atas
            </label>
            <input
              type="text"
              value={settings.heroBadge}
              onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
              placeholder="Warung Sembako & Jajanan Resmi Lenira"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Judul Utama (Teks Putih)
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                placeholder="Sembako Lengkap & Aneka Jajanan Pilihan."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Teks Highlight (Berwarna Kuning)
              </label>
              <input
                type="text"
                value={settings.heroTitleHighlight}
                onChange={(e) => setSettings({ ...settings, heroTitleHighlight: e.target.value })}
                placeholder="Pesan Mudah dari Rumah."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-extrabold text-amber-950 bg-amber-50/70 border-amber-300 focus:outline-none focus:ring-2 focus:ring-warung-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Deskripsi Subjudul
            </label>
            <textarea
              rows={3}
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              placeholder="Belanja kebutuhan pokok dapur, beras pulen, minyak goreng..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 2. 4 Foto Grid Hero Banner */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                2. Foto & Label 4 Kartu Banner (Sebelah Kanan Banner)
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Upload 4 foto produk asli Anda (Beras, Minyak, Basreng, Snack, dll) untuk dipajang di halaman depan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {settings.heroCards.map((card, idx) => (
              <div key={idx} className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                    Kartu #{idx + 1}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">{idx === 0 ? 'Posisi Kiri Atas (Besar)' : idx === 1 ? 'Posisi Kanan Atas' : idx === 2 ? 'Posisi Kiri Bawah' : 'Posisi Kanan Bawah'}</span>
                </div>

                {/* Image Upload Area */}
                <input
                  ref={(el) => (fileInputRefs.current[idx] = el)}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleCardUpload(idx, e)}
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 shadow-2xs flex-shrink-0">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                    {uploadingCardIndex === idx && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Foto Baru
                    </button>
                    <p className="text-[10px] text-stone-400 truncate max-w-full">
                      {card.image.startsWith('data:') ? 'Foto lokal tersimpan' : card.image}
                    </p>
                  </div>
                </div>

                {/* Title & Tag */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Nama / Judul Kartu
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleUpdateCardField(idx, 'title', e.target.value)}
                      placeholder="misal: Beras Premium"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-warung-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Badge Label (Kecil)
                    </label>
                    <input
                      type="text"
                      value={card.tag}
                      onChange={(e) => handleUpdateCardField(idx, 'tag', e.target.value)}
                      placeholder="misal: Kebutuhan Pokok"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-warung-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Angka Metrik & Statistik */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-stone-200/80 space-y-4">
          <div className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-3">
            3. Angka Statistik Bawah Banner
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700">Metrik 1</label>
              <input
                type="text"
                value={settings.stat1Value}
                onChange={(e) => setSettings({ ...settings, stat1Value: e.target.value })}
                placeholder="100%"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-extrabold"
              />
              <input
                type="text"
                value={settings.stat1Label}
                onChange={(e) => setSettings({ ...settings, stat1Label: e.target.value })}
                placeholder="Bahan Pilihan"
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700">Metrik 2</label>
              <input
                type="text"
                value={settings.stat2Value}
                onChange={(e) => setSettings({ ...settings, stat2Value: e.target.value })}
                placeholder="4.9 ★"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-extrabold text-amber-600"
              />
              <input
                type="text"
                value={settings.stat2Label}
                onChange={(e) => setSettings({ ...settings, stat2Label: e.target.value })}
                placeholder="Ulasan Pelanggan"
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700">Metrik 3</label>
              <input
                type="text"
                value={settings.stat3Value}
                onChange={(e) => setSettings({ ...settings, stat3Value: e.target.value })}
                placeholder="Instan"
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-extrabold text-emerald-600"
              />
              <input
                type="text"
                value={settings.stat3Label}
                onChange={(e) => setSettings({ ...settings, stat3Label: e.target.value })}
                placeholder="QRIS Otomatis"
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Floating Save Button on Bottom */}
        <div className="sticky bottom-6 z-20 flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-warung-800 hover:bg-warung-900 text-white font-black text-sm rounded-2xl transition-all shadow-floating active:scale-95 disabled:opacity-60 hover:-translate-y-0.5"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBannerSettingsPage;
