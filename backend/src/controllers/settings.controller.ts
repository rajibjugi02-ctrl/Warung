import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'store_settings.json');

const DEFAULT_SETTINGS = {
  storeName: 'Warung Sembako & Jajanan Lenira',
  storeTagline: 'Sembako Lengkap & Jajanan Nikmat Harian',
  heroBadge: 'Warung Sembako & Jajanan Resmi Lenira',
  heroTitle: 'Sembako Lengkap & Aneka Jajanan Pilihan.',
  heroTitleHighlight: 'Pesan Mudah dari Rumah.',
  heroSubtitle: 'Belanja kebutuhan pokok dapur, beras pulen, minyak goreng, telur segar, serta aneka jajanan basreng dan camilan renyah. Pembayaran instan via QRIS, bisa diantar atau ambil langsung di warung.',
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

function getSettingsData() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return DEFAULT_SETTINGS;
}

export const getStoreSettings = async (_req: Request, res: Response) => {
  try {
    const settings = getSettingsData();
    return sendSuccess(res, 'Pengaturan toko berhasil dimuat.', settings);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat pengaturan toko.', error.message, 500);
  }
};

export const updateStoreSettings = async (req: Request, res: Response) => {
  try {
    const dataDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const current = getSettingsData();
    const updated = {
      ...current,
      ...req.body,
    };

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');

    return sendSuccess(res, 'Pengaturan tampilan berhasil disimpan!', updated);
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return sendError(res, 'Gagal menyimpan pengaturan toko.', error.message, 500);
  }
};
