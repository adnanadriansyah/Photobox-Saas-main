// ============================================
// Simple Gallery Test
// ============================================

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  console.log('🧪 Testing Gallery System...\n')

  try {
    // Check if we have any outlets
    const outletCount = await prisma.outlet.count()
    console.log(`📍 Outlets: ${outletCount}`)

    // Check if we have any sessions
    const sessionCount = await prisma.sessionPhoto.count()
    console.log(`📸 Sessions: ${sessionCount}`)

    // Generate a test gallery code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'

    const letters = Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

    const nums = Array.from({ length: 3 }, () =>
      numbers[Math.floor(Math.random() * numbers.length)]
    ).join('')

    const testCode = letters + nums
    console.log(`🎲 Generated code: ${testCode}`)

    // Check if code exists
    const existing = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: testCode },
    })

    if (existing) {
      console.log('⚠️  Code already exists')
    } else {
      console.log('✅ Code is available')
    }

    console.log('\n🎉 Test completed!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()