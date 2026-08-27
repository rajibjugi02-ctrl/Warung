import React from 'react';
import { Store, ShieldCheck, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 pb-16 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-warung-950 text-white py-14 sm:py-20 border-b border-warung-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-warung-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-14 h-14 bg-warung-800 border border-warung-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-md">
            <Store className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20 mb-3 inline-block">
            Tentang Warung Lenira
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Warung Sembako & Jajanan Harian Anda
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Menghadirkan kebutuhan bahan pokok dapur keluarga dan aneka camilan nikmat dengan pelayanan ramah, harga bersahabat, dan kemudahan transaksi digital.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Story Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-stone-200/80 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-warung-700 uppercase tracking-wider">
              Kisah & Komitmen Kami
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
              Melayani Kebutuhan Pokok & Camilan Warga dengan Sepenuh Hati
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Warung Lenira hadir untuk memudahkan warga sekitar dalam memenuhi kebutuhan sembako pokok sehari-hari—mulai dari beras berkualitas berbagai ukuran satuan (per liter, per kg, hingga karung 5 kg/25 kg), minyak goreng jernih, telur ayam segar, hingga bumbu dapur.
            </p>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              Tak hanya sembako, kami juga menyediakan aneka jajanan gurih legendaris seperti basreng pedas daun jeruk, keripik renyah, serta aneka kue basah segar titipan ibu-ibu mitra lokal sekitar.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-floating border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&auto=format&fit=crop&q=80"
              alt="Warung Lenira Sembako"
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-6">
              <div>
                <span className="text-[10px] font-extrabold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md">
                  Resmi & Terpercaya
                </span>
                <p className="text-sm font-bold text-white mt-1">Sembako Bersih, Higienis & Timbangan Pas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars / Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-card border border-stone-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">Kualitas & Timbangan Pas</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Semua beras, telur, dan minyak dipilih dengan teliti. Takaran dan timbangan dijamin akurat dan jujur.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-card border border-stone-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">Jajanan Gurih & Segar</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Basreng renyah aroma daun jeruk dan kue basah selalu diperbarui setiap hari untuk kenikmatan maksimal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-card border border-stone-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-warung-50 text-warung-800 flex items-center justify-center mx-auto border border-warung-200">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">Dukungan Mitra UMKM</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Membuka peluang bagi ibu-ibu dan pengrajin camilan rumahan sekitar untuk menitipkan hasil karyanya.
            </p>
          </div>
        </div>

        {/* Quick Info & CTA */}
        <div className="bg-warung-900 text-white rounded-3xl p-8 sm:p-10 shadow-floating flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Siap Berbelanja Kebutuhan Harian?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm max-w-md">
              Lihat katalog lengkap beras, minyak, telur, dan jajanan gurih kami sekarang.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/produk"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Mulai Belanja</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/kontak"
              className="px-5 py-3.5 bg-warung-800 hover:bg-warung-700 text-white font-bold text-xs sm:text-sm rounded-2xl border border-warung-600 transition-all"
            >
              Hubungi Kontak
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
