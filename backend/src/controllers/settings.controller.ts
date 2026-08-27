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
