'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/react';

interface ChatHybridProps {
  botId?: string;
}

function ChatHybrid({ 
  botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID || "07b938af-6615-4336-9eab-e35eb458e521"
}: ChatHybridProps = {}) {
  
  const [showFallback, setShowFallback] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const maxCheckAttempts = 10; // Check for 10 seconds

  useEffect(() => {
    console.log('🤖 ChatHybrid component mounted');
    console.log('🔑 Bot ID:', botId);
    
    // Check if Botpress webchat is available and working
    const checkBotpress = () => {
      const attempts = checkAttempts + 1;
      setCheckAttempts(attempts);
      
      if (typeof window !== 'undefined' && (window as any).botpressWebChat) {
        // Check if webchat has been properly initialized
        const webchatElement = document.querySelector('#bp-webchat-widget') || 
                              document.querySelector('[id^="bp-webchat"]') ||
                              document.querySelector('.bp-webchat') ||
                              document.querySelector('[class*="bp-"]');
        
        // Also check if the webchat API is available
        const hasWebchatApi = (window as any).botpressWebChat && 
                             ((window as any).botpressWebChat.open || 
                              (window as any).botpressWebChat.close ||
                              (window as any).botpressWebChat.sendEvent);
        
        if (webchatElement || hasWebchatApi) {
          console.log('✅ Botpress webchat is active and working');
          return true;
        }
        
        // Try to manually check if bot configuration exists
        const scripts = document.querySelectorAll('script[src*="bpcontent.cloud"]');
        if (scripts.length > 0) {
          console.log('✅ Bot configuration script found, webchat should be working');
          return true;
        }
      }
      
      if (attempts >= maxCheckAttempts) {
        console.log('❌ Botpress check timeout, showing Telegram fallback');
        console.log('💡 You may need to add your bot configuration script from Botpress dashboard');
        setShowFallback(true);
        return false;
      }
      
      console.log(`⏳ Checking Botpress... (${attempts}/${maxCheckAttempts})`);
      setTimeout(checkBotpress, 1000);
      return false;
    };

    // Start checking after a short delay
    const initialCheck = setTimeout(checkBotpress, 2000);
    
    return () => {
      clearTimeout(initialCheck);
    };
  }, [botId, checkAttempts]);

  const sendToTelegram = (message: string) => {
    const url = `https://t.me/KacaMeta_bot?start=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Quick message options for Telegram fallback
  const quickMessages = [
    'Halo! Saya ingin konsultasi kacamata 👓',
    'Berapa harga kacamata minus?',
    'Apakah ada promo hari ini?',
    'Lokasi toko di mana?',
    'Cara pesan kacamata online?',
    'Bisa lihat katalog terbaru?'
  ];

  return (
    <>
      {/* Telegram Fallback Chat Widget - Only show if Botpress fails */}
      {showFallback && (
        <>
          {/* Chat Bubble Button */}
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <Button
              size="lg"
              className="rounded-full h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Icon 
                icon={isOpen ? "ph:x-bold" : "ph:chat-circle-dots-fill"} 
                className="h-6 w-6 sm:h-7 sm:w-7 text-white" 
              />
            </Button>
          </div>

          {/* Chat Widget Window */}
          {isOpen && (
            <Card className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[70vh] sm:h-[500px] shadow-2xl z-50 border-0 animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Icon icon="ph:glasses-bold" className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">KacaMeta Assistant</CardTitle>
                      <p className="text-xs text-blue-100 mt-1">
                        Siap membantu Anda 24/7 🚀
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon icon="ph:x-bold" className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full p-0">
                {/* Header Info */}
                <div className="p-4 bg-slate-50 border-b">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Botpress sedang offline, gunakan Telegram</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                    <Icon icon="ph:lightning-bold" className="mr-2 h-4 w-4 text-yellow-500" />
                    Pertanyaan Cepat
                  </h3>
                  
                  {quickMessages.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start text-sm h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-300 border-slate-200 transition-all duration-200"
                      onClick={() => {
                        sendToTelegram(message);
                        setIsOpen(false);
                      }}
                    >
                      <Icon icon="ph:chat-circle-bold" className="mr-3 h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-left leading-relaxed">{message}</span>
                    </Button>
                  ))}
                </div>
                
                {/* Telegram Action Button */}
                <div className="p-4 border-t bg-slate-50">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 transition-all duration-200"
                    onClick={() => {
                      sendToTelegram('Halo KacaMeta! Saya ingin konsultasi tentang kacamata. Mohon bantuan customer service untuk informasi produk dan layanan. Terima kasih! 😊');
                      setIsOpen(false);
                    }}
                  >
                    <Icon icon="ic:baseline-telegram" className="mr-2 h-5 w-5" />
                    Chat Langsung via Telegram
                  </Button>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Respon cepat dari tim customer service kami
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}

export default ChatHybrid;
