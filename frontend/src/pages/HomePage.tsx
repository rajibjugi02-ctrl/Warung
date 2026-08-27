import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Handshake,
  ChevronRight,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Produk Segar & Higienis',
    description: 'Kue dan jajanan selalu diperbarui setiap pagi langsung dari pembuatnya.',
  },
  {
    icon: Zap,
    title: 'Pembayaran QRIS Instan',
    description: 'Bisa scan dari GoPay, OVO, DANA, BCA, BRI, ShopeePay tanpa biaya admin.',
  },
  {
    icon: Handshake,
    title: 'Dukung UMKM & Mitra Lokal',
    description: 'Membantu ibu-ibu rumah tangga & pembuat snack lokal memasarkan kulinernya.',
  },
  {
    icon: Clock,
    title: 'Ambil Langsung di Warung',
    description: 'Pesan online lebih awal, tinggal datang dan ambil langsung di lokasi tanpa antre.',
  },
];

const customerStories = [
  {
    name: 'Ibu Ratna S.',
    role: 'Pelanggan Setia (Perumahan Griya)',
    comment: 'Paling suka pesan basreng pedas daun jeruk & lemper ayamnya. Rasanya pas, praktis bayar QRIS langsung siap diambil sore pas pulang kerja.',
    rating: 5,
  },
  {
    name: 'Budi Hartono',
    role: 'Warga Ciomas',
    comment: 'Beras rojolelenya pulen wangi, bisa beli per liter atau per karung. Pelayanan ramah dan respon cepat banget di WhatsApp.',
    rating: 5,
  },
  {
    name: 'Siti Rahmawati',
    role: 'Mitra Pembuat Kue Basah',
    comment: 'Alhamdulillah terbantu banget bisa menitipkan kue sus dan lemper di Warung Lenira. Rekap penjualannya jelas dan transparan.',
    rating: 5,
  },
];

const defaultHeroSettings = {
  heroBadge: 'Warung Sembako & Jajanan Resmi Lenira',
  heroTitle: 'Sembako Lengkap & Aneka Jajanan Pilihan.',
  heroTitleHighlight: 'Pesan jadi gampang.',
  heroSubtitle: 'Belanja kebutuhan pokok dapur, beras pulen, minyak goreng, telur segar, serta aneka jajanan basreng dan camilan renyah. Pembayaran instan via QRIS, pesan online dan tinggal ambil langsung di warung.',
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
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Basreng Daun Jeruk',
      tag: 'Terfavorit',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Camilan & Snack Gurih',
      tag: 'Camilan Gurih',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSettings, setHeroSettings] = useState<any>(defaultHeroSettings);
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller' | 'consignment' | 'promo'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, setRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories'),
          api.get('/settings').catch(() => null),
        ]);
        setProducts(prodRes.data.data?.products || []);
        setCategories(catRes.data.data || []);
        if (setRes?.data?.data) {
          setHeroSettings({ ...defaultHeroSettings, ...setRes.data.data });
        }
      } catch {
        // Handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'bestseller') return p.isBestSeller;
    if (activeTab === 'consignment') return p.isConsignment;
    if (activeTab === 'promo') return p.discountPrice && p.discountPrice < p.price;
    return true;
  });

  const cards = heroSettings.heroCards && heroSettings.heroCards.length === 4
    ? heroSettings.heroCards
    : defaultHeroSettings.heroCards;

  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-warung-950 via-warung-900 to-warung-800 text-white overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-warung-700/60">
        {/* Subtle Background Glow Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-warung-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warung-800/80 border border-warung-700/80 text-amber-400 text-xs sm:text-sm font-bold shadow-xs backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{heroSettings.heroBadge || defaultHeroSettings.heroBadge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight text-white">
                {heroSettings.heroTitle || 'Sembako Lengkap & Aneka Jajanan Pilihan.'}{' '}
                <span className="text-amber-400 underline decoration-amber-400/40 decoration-wavy decoration-2">
                  {heroSettings.heroTitleHighlight || 'Pesan jadi gampang.'}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {heroSettings.heroSubtitle || defaultHeroSettings.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/produk"
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-extrabold rounded-2xl shadow-floating hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Belanja Sembako & Jajanan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/penitipan"
                  className="px-6 py-3.5 bg-warung-800 hover:bg-warung-700 text-white text-xs sm:text-sm font-bold rounded-2xl border border-warung-700 transition-all flex items-center justify-center gap-2"
                >
                  <Handshake className="w-4 h-4 text-amber-400" />
                  <span>Titip Jajanan Mitra</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-warung-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-lg sm:text-xl font-black text-amber-400">{heroSettings.stat1Value || '100%'}</div>
                  <div className="text-[11px] text-stone-300 font-medium">{heroSettings.stat1Label || 'Bahan Pilihan'}</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-lg sm:text-xl font-black text-amber-400">{heroSettings.stat2Value || '4.9 ★'}</div>
                  <div className="text-[11px] text-stone-300 font-medium">{heroSettings.stat2Label || 'Ulasan Pelanggan'}</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-lg sm:text-xl font-black text-amber-400">{heroSettings.stat3Value || 'Instan'}</div>
                  <div className="text-[11px] text-stone-300 font-medium">{heroSettings.stat3Label || 'QRIS Otomatis'}</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Card Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 animate-scale-up relative">
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-2 z-20 bg-white/95 text-stone-900 px-3.5 py-1.5 rounded-2xl shadow-floating border border-stone-100 flex items-center gap-2 animate-float hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold">🏪 Ambil Langsung di Warung</span>
              </div>

              {/* Column 1 */}
              <div className="space-y-3 sm:space-y-4">
                {cards[0] && (
                  <div className="relative rounded-3xl overflow-hidden shadow-card border border-warung-700/50 group bg-warung-950">
                    <img
                      src={cards[0].image}
                      alt={cards[0].title}
                      className="w-full h-44 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4">
                      <div>
                        {cards[0].tag && (
                          <span className="text-[10px] font-extrabold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md">
                            {cards[0].tag}
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-bold text-white mt-1">{cards[0].title}</p>
                      </div>
                    </div>
                  </div>
                )}

                {cards[1] && (
                  <div className="relative rounded-3xl overflow-hidden shadow-card border border-warung-700/50 group bg-warung-950">
                    <img
                      src={cards[1].image}
                      alt={cards[1].title}
                      className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                      <div>
                        {cards[1].tag && (
                          <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-sm backdrop-blur-xs mb-0.5 inline-block">
                            {cards[1].tag}
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-bold text-white">{cards[1].title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2 */}
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-8">
                {cards[2] && (
                  <div className="relative rounded-3xl overflow-hidden shadow-card border border-warung-700/50 group bg-warung-950">
                    <img
                      src={cards[2].image}
                      alt={cards[2].title}
                      className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4">
                      <div>
                        {cards[2].tag && (
                          <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-sm backdrop-blur-xs mb-0.5 inline-block">
                            {cards[2].tag}
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-bold text-white">{cards[2].title}</p>
                      </div>
                    </div>
                  </div>
                )}

                {cards[3] && (
                  <div className="relative rounded-3xl overflow-hidden shadow-card border border-warung-700/50 group bg-warung-950">
                    <img
                      src={cards[3].image}
                      alt={cards[3].title}
                      className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-4">
                      <div>
                        {cards[3].tag && (
                          <span className="text-[10px] font-extrabold bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md">
                            {cards[3].tag}
                          </span>
                        )}
                        <p className="text-xs sm:text-sm font-bold text-white mt-1">{cards[3].title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST HIGHLIGHTS ================= */}
      <section className="py-8 sm:py-10 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {trustFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-cream-50/80 transition-colors">
                  <div className="w-11 h-11 rounded-2xl bg-warung-50 border border-warung-200 text-warung-800 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 mb-0.5">{item.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CATEGORY BROWSER (2 PILIHAN UTAMA: SEMBAKO & JAJANAN) ================= */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-extrabold text-warung-700 uppercase tracking-wider">Kategori Pilihan</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Pilihan Kategori Warung</h2>
            </div>
            <Link
              to="/produk"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-warung-800 hover:text-warung-900 transition-colors"
            >
              <span>Lihat Semua Produk</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Card 1: Sembako & Kebutuhan Pokok */}
            <Link
              to="/produk?category=sembako"
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-900 via-warung-900 to-warung-950 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-warung-700/40 hover:shadow-floating hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                  <span>🌾 Kebutuhan Dapur Harian</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span>🛒</span> Sembako & Kebutuhan Pokok
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-md">
                  Beras pulen (per kg/liter/karung), minyak goreng, telur ayam segar, gula, dan kebutuhan dapur pokok lainnya.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-warung-800/80">
                <span className="text-xs font-bold text-stone-400">
                  {categories.find((c) => c.slug === 'sembako')?._count?.products ?? 5} Produk Tersedia
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 group-hover:underline">
                  Jelajahi Sembako <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Card 2: Jajanan & Snack */}
            <Link
              to="/produk?category=jajanan"
              className="group relative overflow-hidden bg-gradient-to-br from-amber-950 via-warung-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-amber-900/40 hover:shadow-floating hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
                  <span>🌶️ Renyah & Gurih</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                  <span>🍿</span> Jajanan & Snack
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed max-w-md">
                  Basreng daun jeruk renyah, keripik gurih, aneka camilan pedas, kue basah titipan, dan snack santai.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-warung-800/80">
                <span className="text-xs font-bold text-stone-400">
                  {categories.find((c) => c.slug === 'jajanan')?._count?.products ?? 0} Produk Tersedia
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-400 group-hover:underline">
                  Jelajahi Jajanan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CURATED PRODUCTS CATALOG ================= */}
      <section className="py-12 sm:py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold text-warung-700 uppercase tracking-wider">Katalog Unggulan</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Menu Favorit Warung Lenira</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl overflow-x-auto">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'bestseller', label: '🔥 Terlaris' },
                { id: 'consignment', label: '🤝 Titipan Mitra' },
                { id: 'promo', label: '🏷️ Promo' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-warung-900 shadow-sm scale-102'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array(8).fill(null).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
              <span className="text-4xl mb-2 block">🍱</span>
              <p className="text-sm font-semibold text-stone-700">Belum ada produk untuk kategori ini.</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-3 px-5 py-2.5 bg-warung-800 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-2xl transition-all active:scale-95 shadow-xs"
            >
              <span>Jelajahi Seluruh Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= MITRA TITIPAN BANNER ================= */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-warung-900 via-warung-800 to-warung-950 text-white rounded-3xl p-8 sm:p-12 border border-warung-700/60 shadow-floating relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-warung-700/80 border border-warung-600 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Pemberdayaan UMKM Lokal
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
                Punya Olahan Snack atau Kue Sendiri? Titipkan di Warung Lenira!
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                Kami membantu memasarkan produk makanan buatan Anda ke pelanggan sekitar secara online dan offline. Dapatkan pencatatan stok yang transparan dan pembayaran penjualan yang rapi.
              </p>
              <Link
                to="/penitipan"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                <span>Pelajari Program Titip Produk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-14 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-warung-700 uppercase tracking-wider">Testimoni Warga</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Apa Kata Pelanggan Lenira?</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {customerStories.map((story, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-6 bg-cream-50/80 rounded-3xl border border-stone-200/80 hover:border-warung-300 transition-colors shadow-subtle"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {Array(story.rating)
                      .fill(null)
                      .map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    "{story.comment}"
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-200/60">
                  <div className="font-bold text-xs text-stone-900">{story.name}</div>
                  <div className="text-[11px] text-stone-500">{story.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href="https://wa.me/6281234567890?text=Halo%20Warung%20Lenira%2C%20saya%20mau%20tanya%20produk%20jajanan"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 lg:bottom-6 right-5 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-floating flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        aria-label="Chat WhatsApp Warung"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">Tanya Warung</span>
      </a>
    </div>
  );
};

export default HomePage;
