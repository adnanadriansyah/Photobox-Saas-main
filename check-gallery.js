const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cek apakah gallery code MHN2 sudah ada
  const existingSession = await prisma.sessionPhoto.findUnique({
    where: { galleryCode: 'MHN2' },
  });

  if (existingSession) {
    console.log('✅ Gallery code MHN2 sudah ada:', JSON.stringify(existingSession, null, 2));
    return;
  }

  // Ambil outlet pertama (Aceh Utara)
  const outlet = await prisma.outlet.findFirst({
    where: { machineId: 'BOOTH-ACEH-001' },
  });

  if (!outlet) {
    console.log('❌ Outlet tidak ditemukan');
    return;
  }

  // Buat gallery entry baru untuk MHN2
  const newSession = await prisma.sessionPhoto.create({
    data: {
      outletId: outlet.id,
      frameId: 'frame-4r-classic-001', // Frame 4R Classic
      sessionCode: 'SESSION-MHN2-001',
      status: 'COMPLETED',
      photos: JSON.stringify([
        '/photos/FRAME 4.png',
        '/photos/FRAME 5.png',
      ]),
      totalPrice: 25000,
      paymentMethod: 'CASH',
      paymentStatus: 'COMPLETED',
      galleryCode: 'MHN2',
      galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
    },
  });

  console.log('✅ Gallery code MHN2 berhasil dibuat:', JSON.stringify(newSession, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
