import React, { useState, useEffect } from 'react';
import { Handshake, Phone, MapPin, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Product, ConsignmentMaker } from '../types';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';

const ConsignmentPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [makers, setMakers] = useState<ConsignmentMaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/consignments')
      .then((res) => {
        setProducts(res.data.data?.products || []);
        setMakers(res.data.data?.makers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 pb-16 animate-fade-in">
      {/* Editorial Header */}
      <section className="bg-warung-900 text-white py-14 sm:py-20 border-b border-warung-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-warung-800 border border-warung-700 text-amber-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
            <Handshake className="w-3.5 h-3.5" />
            Program Kemitraan UMKM & Ibu Rumah Tangga
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Titipkan Olahan Makanan & Kue Anda di Warung Lenira
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Kami menyediakan wadah penjualan offline di etalase warung dan online di website untuk membantu produk kuliner buatan Anda menjangkau lebih banyak pelanggan.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Step by step Process */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 mb-12 shadow-card">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-bold text-warung-700 uppercase tracking-wider">Alur Kerjasama</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
              Cara Mudah Menjadi Mitra Titipan
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Konsultasi & Pendaftaran',
                desc: 'Hubungi pengelola Warung Lenira via WhatsApp. Diskusikan jenis jajanan/kue, kemasan, harga, dan jadwal drop produk.',
              },
              {
                step: '02',
                title: 'Pengiriman Stok Harian',
                desc: 'Bawa stok produk segar ke warung setiap pagi. Produk akan dicatat dan langsung dimasukkan ke katalog online.',
              },
              {
                step: '03',
                title: 'Laporan & Pembayaran',
                desc: 'Dapatkan rekap penjualan harian/mingguan yang transparan. Pembayaran hasil penjualan dikirim tepat waktu.',
              },
            ].map((item) => (
              <div key={item.step} className="p-5 bg-cream-50 rounded-2xl border border-stone-200/70 relative flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-warung-800/40 mb-2 block">{item.step}</span>
                  <h3 className="font-bold text-sm text-stone-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1.5 text-warung-800 text-[11px] font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-warung-600" />
                  <span>Proses Transparan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitra Profiles */}
        {!loading && makers.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-warung-700 uppercase tracking-wider">Komunitas</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">Mitra Pembuat Aktif</h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {makers.map((maker) => (
                <div
                  key={maker.id}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-subtle hover:border-warung-300 transition-all"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-11 h-11 bg-warung-100 text-warung-800 rounded-xl flex items-center justify-center font-bold text-base">
                      {maker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">{maker.name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{maker.address || 'Sekitar Lokasi Warung'}</span>
                      </div>
                    </div>
                  </div>
                  {maker.bio && (
                    <p className="text-xs text-stone-600 leading-relaxed bg-cream-50 p-3 rounded-xl border border-stone-200/60">
                      {maker.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Titipan Catalog */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-warung-700 uppercase tracking-wider">Etalase Titipan</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">Jajanan & Kue Segar Hari Ini</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array(4).fill(null).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-6">
              <span className="text-4xl mb-2 block">🍱</span>
              <p className="text-xs sm:text-sm font-semibold text-stone-600">Belum ada produk titipan yang aktif hari ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Contact WhatsApp */}
        <div className="mt-14 bg-gradient-to-r from-warung-900 to-warung-800 text-white rounded-3xl p-8 sm:p-10 border border-warung-700 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-lg sm:text-xl text-white">Ingin Menitipkan Produk Anda?</h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Diskusikan langsung dengan pengelola Warung Lenira. Kami menyambut berbagai aneka jajanan segar dan cemilan kemasan.
            </p>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Warung%20Lenira%2C%20saya%20tertarik%20untuk%20menitipkan%20produk%20makanan%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex-shrink-0 active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConsignmentPage;
