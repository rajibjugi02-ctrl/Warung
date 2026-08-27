import React from 'react';
import { MapPin, Phone, Mail, Instagram, Clock, MessageCircle, Store, ChevronRight } from 'lucide-react';
import { generateWhatsAppLink } from '../utils/format';

const ContactPage: React.FC = () => {
  const waLink = generateWhatsAppLink(
    '0895333691222',
    'Halo Warung Jajanan Lenira! Saya ingin bertanya tentang ketersediaan produk/pemesanan.'
  );

  return (
    <div className="min-h-screen bg-cream-50 pb-16 animate-fade-in">
      {/* Header */}
      <section className="bg-warung-900 text-white py-14 sm:py-18 border-b border-warung-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 bg-warung-800 border border-warung-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Hubungi Warung Lenira
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Kami siap melayani kebutuhan jajanan, kue basah, aneka camilan gurih, hingga pesanan khusus snack box untuk acara Anda.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-6 space-y-4">
            {[
              {
                icon: MapPin,
                title: 'Alamat Lokasi Warung',
                lines: [
                  'CQ38+457, Padasuka, Ciomas,',
                  'Bogor Regency, West Java 16610',
                ],
                link: 'https://maps.google.com/?q=CQ38%2B457,+Padasuka,+Ciomas,+Bogor+Regency,+West+Java+16610',
                linkLabel: 'Buka di Google Maps',
              },
              {
                icon: Phone,
                title: 'Nomor WhatsApp Resmi',
                lines: ['0895-3336-91222', 'Respon cepat setiap hari pukul 07.00 – 22.00 WIB'],
                link: waLink,
                linkLabel: 'Chat WhatsApp Sekarang',
              },
              {
                icon: Mail,
                title: 'Email Resmi',
                lines: ['warunglenira@gmail.com'],
                link: 'mailto:warunglenira@gmail.com',
                linkLabel: 'Kirim Pesan Email',
              },
              {
                icon: Clock,
                title: 'Jam Buka Operasional',
                lines: [
                  'Buka Setiap Hari: 07.00 – 22.00 WIB',
                  'Pesanan snack box acara disarankan H-1 / H-2',
                ],
              },
              {
                icon: Instagram,
                title: 'Media Sosial',
                lines: ['@warunglenira (Info jajanan terbaru & promo)'],
                link: 'https://instagram.com/warunglenira',
                linkLabel: 'Buka Profil Instagram',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-subtle hover:border-warung-300 transition-all flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-warung-50 border border-warung-200/60 text-warung-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-stone-900 mb-1">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-stone-500 text-xs leading-relaxed">{line}</p>
                    ))}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-warung-800 hover:text-warung-900 transition-colors"
                      >
                        <span>{item.linkLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive CTA & Story */}
          <div className="lg:col-span-6 space-y-6">
            {/* Quick WhatsApp Action Card */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl p-6 transition-all shadow-card hover:shadow-hover group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-base mb-0.5">Chat Langsung via WhatsApp</div>
                <div className="text-emerald-100 text-xs">Hubungi kami di 0895-3336-91222 untuk pemesanan cepat</div>
              </div>
              <div className="text-white/70 group-hover:translate-x-1 transition-transform">→</div>
            </a>

            {/* About Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-card">
              <span className="text-xs font-bold text-warung-700 uppercase tracking-wider">Tentang Kami</span>
              <h2 className="text-xl font-extrabold text-stone-900 mt-1 mb-3">Warung Jajanan Lenira</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Berlokasi di Ciomas, Bogor Regency, Warung Lenira hadir melayani kebutuhan jajanan gurih, kue basah titipan ibu-ibu rumah tangga, hingga sembako praktis setiap hari dari jam 07.00 sampai 22.00 WIB.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-3">
                Dengan website ini, Anda dapat memesan camilan favorit dengan pembayaran QRIS otomatis yang cepat, higienis, dan terpercaya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
