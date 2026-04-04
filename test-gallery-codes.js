const { generateUniqueGalleryCode, createNewPhotoSession } = require('./src/lib/gallery-code-generator')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Gallery Code Generator...\n')

  // Test 1: Generate unique codes
  console.log('1. Generating 5 unique gallery codes:')
  for (let i = 0; i < 5; i++) {
    const code = await generateUniqueGalleryCode()
    console.log(`   Code ${i + 1}: ${code}`)
  }

  // Test 2: Check if MHN2 exists
  console.log('\n2. Checking existing gallery codes:')
  const existingCodes = ['MHN2', 'ABC123DEF456', 'XYZ789UVW012', 'DEMO1234ABCD']
  for (const code of existingCodes) {
    const session = await prisma.sessionPhoto.findUnique({
      where: { galleryCode: code },
    })
    console.log(`   ${code}: ${session ? 'EXISTS' : 'NOT FOUND'}`)
  }

  // Test 3: Create new session
  console.log('\n3. Creating new photo session:')
  try {
    const outlet = await prisma.outlet.findFirst()
    if (outlet) {
      const newSession = await createNewPhotoSession(outlet.id)
      console.log(`   New session created:`)
      console.log(`   - Gallery Code: ${newSession.galleryCode}`)
      console.log(`   - Session Code: ${newSession.sessionCode}`)
      console.log(`   - Status: ${newSession.status}`)
    } else {
      console.log('   No outlet found')
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`)
  }

  await prisma.$disconnect()
  console.log('\n✅ Test completed!')
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
