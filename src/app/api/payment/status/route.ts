// ============================================
// Payment Status Check API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentGateway, DemoPaymentAdapter } from '@/lib/payment/adapter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const transactionRef = request.nextUrl.searchParams.get('ref')

    if (!transactionRef) {
      return NextResponse.json(
        { success: false, error: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    let gateway = getPaymentGateway('doku')

    let result = await gateway.checkPayment(transactionRef)

    // Fallback ke demo mode jika gateway gagal
    if (!result.success) {
      console.warn('[Payment Status] Gateway failed, falling back to demo:', result.error)
      gateway = new DemoPaymentAdapter()
      result = await gateway.checkPayment(transactionRef)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status,
        paidAt: result.paidAt?.toISOString(),
      })
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to check payment status' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Payment status API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
