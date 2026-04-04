// ============================================
// Debug Gallery API
// ============================================

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugGallery() {
  console.log('🔍 Debugging Gallery API...\n')

  try {
    // Check database connection
    console.log('📊 Database Status:')
    const sessionCount = await prisma.sessionPhoto.count()
    console.log(`   Sessions: ${sessionCount}`)

    // Check if ABC123 exists
    console.log('\n🎯 Checking ABC123:')
    const session = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: 'ABC123' },
      include: { outlet: true }
    })

    if (session) {
      console.log('   ✅ Found!')
      console.log(`   Status: ${session.status}`)
      console.log(`   Photos: ${session.photos}`)
      console.log(`   Outlet: ${session.outlet?.name}`)
      console.log(`   Expires: ${session.galleryExpiresAt}`)
    } else {
      console.log('   ❌ Not found')
    }

    // List all gallery codes
    console.log('\n📋 All Gallery Codes:')
    const allSessions = await prisma.sessionPhoto.findMany({
      select: { galleryCode: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    allSessions.forEach(s => {
      console.log(`   ${s.galleryCode} - ${s.status} - ${s.createdAt.toISOString().split('T')[0]}`)
    })

    // Test API simulation
    console.log('\n🌐 API Response Simulation:')
    if (session) {
      const photos = JSON.parse(session.photos || '[]')
      const response = {
        success: true,
        data: {
          code: session.galleryCode,
          photos,
          outlet: {
            name: session.outlet?.name,
            location: session.outlet?.address,
          },
          createdAt: session.createdAt,
          expiresAt: session.galleryExpiresAt,
        }
      }
      console.log(JSON.stringify(response, null, 2))
    } else {
      console.log(JSON.stringify({
        success: false,
        error: 'Gallery not found'
      }, null, 2))
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugGallery()