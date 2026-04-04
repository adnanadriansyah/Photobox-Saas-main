// ============================================
// Test Gallery API
// ============================================

async function testGalleryAPI() {
  console.log('🌐 Testing Gallery API...\n')

  try {
    const response = await fetch('http://localhost:3008/api/gallery?code=ABC123')
    const data = await response.json()

    console.log('📡 Response Status:', response.status)
    console.log('📄 Response Data:')
    console.log(JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('\n✅ Gallery API working!')
      console.log(`   Code: ${data.data.code}`)
      console.log(`   Photos: ${data.data.photos.length} items`)
      console.log(`   Outlet: ${data.data.outlet.name}`)
    } else {
      console.log('\n❌ Gallery API error:', data.error)
    }

  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testGalleryAPI()