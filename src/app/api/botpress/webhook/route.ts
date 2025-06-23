// app/api/botpress/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Botpress webhook received:', body);
    
    // Verify webhook signature (optional tapi recommended)
    // const signature = request.headers.get('x-bp-signature');
    // if (!verifyBotpressSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    // }

    const { type, payload } = body;
    
    switch (type) {
      case 'message_created':
        await handleMessageCreated(payload);
        break;
      case 'conversation_started':
        await handleConversationStarted(payload);
        break;
      case 'user_created':
        await handleUserCreated(payload);
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Botpress webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessageCreated(payload: any) {
  const { conversationId, userId, channel, text, tags } = payload;
  
  // Create or update session
  await prisma.botpressSession.upsert({
    where: { botpressUserId: userId },
    update: {
      conversationId,
      updatedAt: new Date()
    },
    create: {
      botpressUserId: userId,
      conversationId,
      phoneNumber: extractPhoneFromUserId(userId, channel)
    }
  });

  // Check if this is a consultation request
  if (tags?.includes('consultation') || text?.includes('Konsultasi ID:')) {
    await handleConsultationRequest(payload);
  }
}

async function handleConsultationRequest(payload: any) {
  const { userId, text } = payload;
  
  // Extract consultation data from message or tags
  const consultationId = extractConsultationId(text);
  const session = await prisma.botpressSession.findUnique({
    where: { botpressUserId: userId }
  });

  if (session && consultationId) {
    const consultation = await prisma.prescriptionConsultation.create({
      data: {
        id: consultationId,
        customerName: (session.sessionData as { customerName?: string })?.customerName || 'WhatsApp User',
        phoneNumber: session.phoneNumber || '',
        source: 'BOTPRESS',
        status: 'PENDING',
        botpressSessionId: session.id,
        responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      }
    });

    // Notify admin
    await notifyAdminNewConsultation(consultation);
  }
}

function extractPhoneFromUserId(userId: string, channel: string): string | null {
  // Extract phone number from Botpress user ID format
  // Format biasanya: whatsapp:+628123456789 atau similar
  if (channel === 'whatsapp' && userId.includes(':+15817019840')) {
    return userId.split(':')[1];
  }
  return null;
}

function extractConsultationId(text: string): string | null {
  const match = text.match(/Konsultasi ID:\s*([A-Z0-9-]+)/);
  return match ? match[1] : null;
}

async function notifyAdminNewConsultation(consultation: any) {
  // TODO: Send notification to admin
  // Could be email, WhatsApp, or real-time notification
  console.log('New consultation:', consultation.id);
}

async function handleConversationStarted(payload: any) {
  // Handle new conversation logic
  console.log('New conversation started:', payload.conversationId);
}

async function handleUserCreated(payload: any) {
  // Handle new user logic
  console.log('New user created:', payload.userId);
}