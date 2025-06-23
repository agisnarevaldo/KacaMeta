'use client';

import { usePathname } from 'next/navigation';
import BotpressScripts from '@/components/botpress-scripts';

export default function ConditionalBotpress() {
  const pathname = usePathname();
  
  // Don't show Botpress chat on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <BotpressScripts />;
}
