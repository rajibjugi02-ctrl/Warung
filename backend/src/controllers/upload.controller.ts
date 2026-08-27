import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { sendSuccess, sendError } from '../utils/response';

// Initialize Supabase client for storage
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return sendError(res, 'Data gambar tidak ditemukan.', null, 400);
    }

    // If it's already an http/https URL, return it as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return sendSuccess(res, 'URL gambar valid.', { url: image });
    }

    // Parse base64 data url
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return sendError(res, 'Format base64 gambar tidak valid.', null, 400);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType === 'image/jpeg') ext = 'jpg';
    else if (mimeType === 'image/gif') ext = 'gif';

    const safeName = (name || 'produk')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const fileName = `${safeName}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;

    // Try Supabase Storage first (production)
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.storage
        .from('produk-images')
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage error:', error);
        return sendError(res, 'Gagal mengunggah gambar ke storage.', error.message, 500);
      }

      const { data: publicData } = supabase.storage
        .from('produk-images')
        .getPublicUrl(fileName);

      return sendSuccess(res, 'Gambar berhasil diunggah.', {
        url: publicData.publicUrl,
        fileName,
      });
    }

    // Fallback: save to local filesystem (development only)
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5050';
    const fileUrl = `${backendUrl}/uploads/${fileName}`;

    return sendSuccess(res, 'Gambar berhasil diunggah (lokal).', {
      url: fileUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return sendError(res, 'Gagal mengunggah gambar.', error.message, 500);
  }
};
