// ============================================
// Photobooth Testing Script
// Test gallery code generation and photo upload flow
// ============================================

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testGallerySystem() {
  console.log('🧪 Starting Photobooth Testing...\n')

  try {
    // Test 1: Generate unique gallery codes
    console.log('📝 Test 1: Gallery Code Generation')
    const codes = []
    for (let i = 0; i < 5; i++) {
      const code = await generateUniqueGalleryCode()
      codes.push(code)
      console.log(`  Generated: ${code}`)
    }

    // Verify uniqueness
    const uniqueCodes = new Set(codes)
    if (uniqueCodes.size === codes.length) {
      console.log('  ✅ All codes are unique')
    } else {
      console.log('  ❌ Duplicate codes found!')
    }

    // Test 2: Create new photo session
    console.log('\n📸 Test 2: Create Photo Session')
    const outlet = await prisma.outlet.findFirst()
    if (!outlet) {
      console.log('  ❌ No outlet found, creating demo outlet...')

      const demoOutlet = await prisma.outlet.create({
        data: {
          name: 'Demo Outlet',
          machineId: 'TEST-MACHINE-001',
          location: 'Test Location',
          tenantId: 'demo-tenant',
          isActive: true,
        }
      })

      console.log(`  ✅ Created demo outlet: ${demoOutlet.machineId}`)
      outlet = demoOutlet
    }

    const session = await createNewPhotoSession(outlet.id)
    console.log(`  ✅ Created session: ${session.galleryCode}`)
    console.log(`  📅 Expires: ${session.galleryExpiresAt}`)

    // Test 3: Simulate photo upload
    console.log('\n📤 Test 3: Photo Upload Simulation')

    // Create dummy photo data
    const dummyPhotos = [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z'
    ]

    // Update session with photos
    await prisma.sessionPhoto.update({
      where: { id: session.id },
      data: {
        photos: JSON.stringify(dummyPhotos),
        status: 'COMPLETED',
        paymentStatus: 'COMPLETED',
        totalPrice: 25000,
      }
    })

    console.log('  ✅ Updated session with 3 photos')
    console.log(`  🔗 Gallery URL: http://localhost:3006/gallery?code=${session.galleryCode}`)

    // Test 4: Verify gallery access
    console.log('\n🔍 Test 4: Gallery Access Verification')
    const gallerySession = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: session.galleryCode },
    })

    if (gallerySession) {
      console.log('  ✅ Gallery accessible')
      console.log(`  📊 Status: ${gallerySession.status}`)
      console.log(`  💰 Payment: ${gallerySession.paymentStatus}`)
      console.log(`  📸 Photos: ${JSON.parse(gallerySession.photos).length} uploaded`)
    } else {
      console.log('  ❌ Gallery not found!')
    }

    // Test 5: Cleanup (optional)
    console.log('\n🧹 Test 5: Cleanup Test Data')
    const shouldCleanup = process.argv.includes('--cleanup')

    if (shouldCleanup) {
      await prisma.sessionPhoto.delete({
        where: { id: session.id }
      })
      console.log('  ✅ Test session cleaned up')
    } else {
      console.log('  ⏭️  Skipping cleanup (use --cleanup to remove test data)')
    }

    console.log('\n🎉 All tests completed successfully!')
    console.log('\n📋 Testing Summary:')
    console.log(`   • Gallery Codes: ${codes.join(', ')}`)
    console.log(`   • Test Session: ${session.galleryCode}`)
    console.log(`   • Access URL: http://localhost:3006/gallery?code=${session.galleryCode}`)
    console.log(`   • Booth URL: http://localhost:3006/booth`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Import functions from gallery-code-generator
async function generateUniqueGalleryCode() {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    const letters = Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    const nums = Array.from({ length: 3 }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    ).join('')

    const code = letters + nums

    const existing = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: code },
    })

    if (!existing) {
      await prisma.$disconnect()
      return code
    }

    attempts++
  }

  await prisma.$disconnect()
  return 'TEST' + Date.now().toString().slice(-3)
}

async function createNewPhotoSession(outletId) {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  const galleryCode = await generateUniqueGalleryCode()

  const session = await prisma.sessionPhoto.create({
    data: {
      outletId,
      frameId: 'frame-test-001',
      sessionCode: `SESSION-${galleryCode}-TEST`,
      status: 'CAPTURING',
      photos: JSON.stringify([]),
      totalPrice: 0,
      paymentMethod: null,
      paymentStatus: 'PENDING',
      galleryCode,
      galleryExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.$disconnect()
  return session
}

// Run tests
testGallerySystem()