import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, amount, machineId } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher wajib diisi' },
        { status: 400 }
      )
    }

    let targetMachineId = machineId

    // Cari outlet dari machineId
    if (machineId) {
      const outlet = await prisma.outlet.findUnique({
        where: { machineId },
        include: { tenant: true },
      })
      if (outlet) {
        targetMachineId = outlet.machineId
      }
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
      include: { tenant: true },
    })

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Kode voucher tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah voucher aktif
    if (!voucher.isActive) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah tidak aktif' },
        { status: 400 }
      )
    }

    // Cek masa berlaku
    const now = new Date()
    if (now < voucher.validFrom) {
      return NextResponse.json(
        { success: false, error: 'Voucher belum berlaku' },
        { status: 400 }
      )
    }
    if (now > voucher.validUntil) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      )
    }

    // Cek batas pemakaian
    if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Voucher sudah habis dipakai' },
        { status: 400 }
      )
    }

    // Cek minimum order
    const targetAmount = amount || 0
    if (targetAmount < voucher.minOrder) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimal belanja Rp ${voucher.minOrder.toLocaleString('id-ID')} untuk menggunakan voucher ini`,
        },
        { status: 400 }
      )
    }

    // Hitung diskon
    let discount = 0
    if (voucher.type === 'PERCENTAGE') {
      discount = Math.round(targetAmount * (voucher.value / 100))
    } else {
      discount = voucher.value
    }

    // Pastikan diskon tidak melebihi total
    if (discount > targetAmount) {
      discount = targetAmount
    }

    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discount,
        finalPrice: targetAmount - discount,
        description:
          voucher.type === 'PERCENTAGE'
            ? `Diskon ${voucher.value}%`
            : `Diskon Rp ${voucher.value.toLocaleString('id-ID')}`,
      },
    })
  } catch (error) {
    console.error('Voucher validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan, coba lagi' },
      { status: 500 }
    )
  }
}
