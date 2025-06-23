import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const whatsappNumber = process.env.ADMIN_PHONE_NUMBER || '6281234567890'
    
    return NextResponse.json({ 
      whatsappNumber: whatsappNumber 
    })
  } catch (error) {
    console.error('Error getting WhatsApp config:', error)
    return NextResponse.json(
      { error: 'Failed to get WhatsApp config' },
      { status: 500 }
    )
  }
}
