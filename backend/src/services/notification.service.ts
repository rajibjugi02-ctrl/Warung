// Uses native fetch (Node.js 18+)

/**
 * Kirim notifikasi WhatsApp ke pemilik warung via Fonnte
 * Daftar gratis di https://fonnte.com - 100 pesan/bulan gratis
 */
export const sendWhatsAppNotification = async (message: string): Promise<void> => {
  const token = process.env.FONNTE_TOKEN;
  const ownerPhone = process.env.OWNER_WHATSAPP;

  if (!token || !ownerPhone) {
    console.log('[WA Notification] FONNTE_TOKEN or OWNER_WHATSAPP not configured, skipping.');
    return;
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: ownerPhone,
        message,
        delay: '2',
        countryCode: '62',
      }),
    });

    const result = await response.json() as any;
    if (result.status) {
      console.log('[WA Notification] Notifikasi WA berhasil dikirim ke pemilik.');
    } else {
      console.error('[WA Notification] Gagal kirim WA:', result);
    }
  } catch (err) {
    console.error('[WA Notification] Error kirim WA:', err);
  }
};
