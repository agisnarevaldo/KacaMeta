'use client';

import { usePathname } from 'next/navigation';
import ChatHybrid from '@/components/chat-hybrid';

export default function ConditionalChat() {
  const pathname = usePathname();
  
  // Don't show chat widget on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <ChatHybrid />;
}
