'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function BotpressScripts() {
  useEffect(() => {
    // Check if scripts are already loaded (for hot reloads)
    if (typeof window !== 'undefined') {
      // Check if Botpress is already available
      if ((window as any).bp) {
        console.log('✅ Botpress is already available');
      }
    }
  }, []);

  const handleInjectLoad = () => {
    console.log('✅ Botpress inject script loaded');
  };

  const handleInjectError = (e: any) => {
    console.error('❌ Botpress inject script failed to load:', e);
  };

  const handleConfigLoad = () => {
    console.log('✅ Botpress configuration script loaded');
    
    // Additional check to see if Botpress is available
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).bp) {
        console.log('✅ Botpress webchat is now available');
      }
    }, 1000);
  };

  const handleConfigError = (e: any) => {
    console.error('❌ Botpress configuration script failed to load:', e);
  };

  return (
    <>
      {/* Botpress Inject Script - Must load first */}
      <Script 
        src="https://cdn.botpress.cloud/webchat/v3.0/inject.js" 
        strategy="afterInteractive"
        id="botpress-inject"
        onLoad={handleInjectLoad}
        onError={handleInjectError}
      />
      
      {/* Botpress Configuration Script - Load after inject */}
      <Script 
        src="https://files.bpcontent.cloud/2025/06/15/22/20250615221654-G33MVXK5.js" 
        strategy="lazyOnload"
        id="botpress-config"
        onLoad={handleConfigLoad}
        onError={handleConfigError}
      />
    </>
  );
}
