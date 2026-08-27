import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, Instagram, MessageCircle, Clock } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/format';

const Footer: React.FC = () => {
  const waLink = generateWhatsAppLink(
    '0895333691222',
    'Halo Warung Lenira, saya ingin bertanya tentang produk.'
  );

  return (
    <footer className="bg-warung-950 text-cream-200 border-t border-warung-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-warung-700 rounded-xl flex items-center justify-center text-white">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">Warung Jajanan</div>
                <div className="font-bold text-amber-400 text-sm leading-tight">Lenira</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-5">
              Warung jajanan terpercaya di Ciomas, Bogor. Menyediakan aneka camilan gurih, basreng, kue basah titipan segar, dan kebutuhan harian dengan pembayaran QRIS praktis.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-warung-800 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm"
                title="WhatsApp 0895-3336-91222"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/warunglenira"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-warung-800 hover:bg-pink-700 text-white rounded-xl transition-all shadow-sm"
                title="Instagram @warunglenira"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:warunglenira@gmail.com"
                className="p-2.5 bg-warung-800 hover:bg-warung-700 text-white rounded-xl transition-all shadow-sm"
                title="Email warunglenira@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Navigasi Menu</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', to: '/' },
                { label: 'Semua Produk', to: '/produk' },
                { label: 'Jajanan & Snack', to: '/jajanan' },
                { label: 'Mitra Titipan UMKM', to: '/penitipan' },
                { label: 'Kontak & Lokasi', to: '/kontak' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-stone-300 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Layanan Pelanggan</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Keranjang Belanja', to: '/keranjang' },
                { label: 'Cara Pembayaran QRIS', to: '/kontak' },
                { label: 'Program Titip Jajanan', to: '/penitipan' },
                { label: 'Hubungi Pengelola', to: '/kontak' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-stone-300 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-wider">Informasi & Lokasi</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>CQ38+457, Padasuka, Ciomas, Bogor Regency, West Java 16610</span>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-300 hover:text-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>0895-3336-91222 (WhatsApp)</span>
              </a>
              <a
                href="mailto:warunglenira@gmail.com"
                className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-300 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>warunglenira@gmail.com</span>
              </a>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Buka Setiap Hari:</span>
                  <p className="text-stone-400 text-xs">07.00 – 22.00 WIB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-warung-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-stone-400">
            © 2026 Warung Jajanan Lenira • Ciomas, Bogor Regency.
          </p>
          <p className="text-[11px] text-stone-500">
            Belanja Jajanan Enak & Praktis dari Rumah
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
