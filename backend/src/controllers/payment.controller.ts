import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { PaymentService } from '../services/payment.service';
import { sendSuccess, sendError } from '../utils/response';

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const payment = await PaymentService.getPaymentStatus(orderId);

    if (!payment) {
      return sendError(res, 'Informasi pembayaran tidak ditemukan.', null, 404);
    }

    return sendSuccess(res, 'Status pembayaran berhasil dimuat.', payment);
  } catch (error: any) {
    return sendError(res, 'Gagal memeriksa status pembayaran.', error.message, 500);
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const result = await PaymentService.handleWebhook(payload);

    return res.status(200).json({
      status: 'OK',
      message: 'Webhook processed successfully',
      result,
    });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(400).json({
      status: 'ERROR',
      message: error.message,
    });
  }
};

/**
 * Developer / Interactive sandbox simulator endpoint
 * Simulates a successful customer scan & payment via webhook
 */
export const simulatePaymentSuccess = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendError(res, 'Order ID wajib diisi.', null, 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (!order) {
      return sendError(res, 'Pesanan tidak ditemukan.', null, 404);
    }

    const payment = await prisma.payment.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
    });

    const result = await PaymentService.handleWebhook({
      transaction_id: payment?.transactionId || `TRX-SIM-${Date.now()}`,
      order_id: order.id,
      gross_amount: order.totalAmount,
      transaction_status: 'settlement',
      status_code: '200',
    });

    return sendSuccess(res, 'Simulasi pembayaran sukses! Status pesanan otomatis menjadi PAID.', result);
  } catch (error: any) {
    return sendError(res, 'Gagal mensimulasikan pembayaran.', error.message, 500);
  }
};
