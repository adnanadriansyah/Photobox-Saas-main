// ============================================
// Create Test Gallery Data
// ============================================

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestGallery() {
  console.log('🧪 Creating test gallery ABC123...\n')

  try {
    // Check if tenant exists, create if not
    let tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      console.log('🏢 Creating demo tenant...')
      tenant = await prisma.tenant.create({
        data: {
          name: 'Demo Tenant',
          email: 'demo@example.com',
          phone: '+6281234567890',
          isActive: true,
        }
      })
      console.log(`✅ Created tenant: ${tenant.id}`)
    }

    // Check if outlet exists
    let outlet = await prisma.outlet.findFirst()
    if (!outlet) {
      console.log('📍 Creating demo outlet...')
      outlet = await prisma.outlet.create({
        data: {
          tenantId: tenant.id,
          name: 'Demo Outlet',
          machineId: 'DEMO-001',
          location: 'Test Location',
          address: 'Jl. Test No. 123',
          phone: '+6281234567890',
          isActive: true,
        }
      })
      console.log(`✅ Created outlet: ${outlet.id}`)
    }

    // Check if ABC123 already exists
    const existing = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: 'ABC123' }
    })

    if (existing) {
      console.log('⚠️  ABC123 already exists, updating...')
      await prisma.sessionPhoto.update({
        where: { id: existing.id },
        data: {
          photos: JSON.stringify([
            '/photos/sample1.jpg',
            '/photos/sample2.jpg',
            '/photos/sample3.jpg'
          ]),
          status: 'COMPLETED',
          paymentStatus: 'COMPLETED',
          galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      })
      console.log('✅ Updated existing ABC123 gallery')
    } else {
      // Create new session
      const session = await prisma.sessionPhoto.create({
        data: {
          outletId: outlet.id,
          frameId: null, // No frame for demo
          sessionCode: 'SESSION-ABC123-DEMO',
          status: 'COMPLETED',
          photos: JSON.stringify([
            '/photos/sample1.jpg',
            '/photos/sample2.jpg',
            '/photos/sample3.jpg'
          ]),
          totalPrice: 25000,
          paymentMethod: 'DEMO',
          paymentStatus: 'COMPLETED',
          galleryCode: 'ABC123',
          galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }
      })
      console.log('✅ Created new ABC123 gallery')
      console.log(`   ID: ${session.id}`)
    }

    // Verify
    const verify = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: 'ABC123' },
      include: { outlet: true }
    })

    if (verify) {
      console.log('\n🎉 Verification:')
      console.log(`   Code: ${verify.galleryCode}`)
      console.log(`   Status: ${verify.status}`)
      console.log(`   Photos: ${JSON.parse(verify.photos).length} items`)
      console.log(`   Outlet: ${verify.outlet.name}`)
      console.log(`   Expires: ${verify.galleryExpiresAt}`)
      console.log(`\n🔗 Test URL: http://localhost:3006/gallery?code=ABC123`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestGallery()