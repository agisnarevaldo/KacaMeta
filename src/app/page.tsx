"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useState } from "react";

// Data produk placeholder
const products = [
  {
    id: 1,
    name: "Kacamata Classic Retro",
    price: "Rp 299.000",
    category: "pria",
    image: "/api/placeholder/300/200",
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Sunglasses Premium Lady",
    price: "Rp 450.000",
    category: "wanita",
    image: "/api/placeholder/300/200",
    badge: "New"
  },
  {
    id: 3,
    name: "Anti Radiasi Blue Light",
    price: "Rp 350.000",
    category: "anti-radiasi",
    image: "/api/placeholder/300/200",
    badge: "Popular"
  },
  {
    id: 4,
    name: "Kids Fun Glasses",
    price: "Rp 180.000",
    category: "anak",
    image: "/api/placeholder/300/200",
    badge: ""
  },
  {
    id: 5,
    name: "Executive Men Style",
    price: "Rp 520.000",
    category: "pria",
    image: "/api/placeholder/300/200",
    badge: "Premium"
  },
  {
    id: 6,
    name: "Elegant Women Frame",
    price: "Rp 420.000",
    category: "wanita",
    image: "/api/placeholder/300/200",
    badge: ""
  }
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("semua");

  const filteredProducts = products.filter(product => 
    activeCategory === "semua" || product.category === activeCategory
  );

  const whatsappNumber = "6281234567890"; // Ganti dengan nomor WhatsApp yang benar
  
  const sendWhatsApp = (productName?: string) => {
    const message = productName 
      ? `Halo! Saya tertarik dengan ${productName}. Bisa info lebih lanjut?`
      : "Halo! Saya ingin melihat katalog kacamata KacaMeta.";
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar Sticky */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Icon icon="ph:glasses-bold" className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">KacaMeta</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#beranda" className="text-slate-700 hover:text-blue-600 transition-colors">Beranda</a>
              <a href="#katalog" className="text-slate-700 hover:text-blue-600 transition-colors">Katalog</a>
              <Button 
                onClick={() => sendWhatsApp()} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Icon icon="ic:baseline-whatsapp" className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Icon icon="ph:glasses-bold" className="h-20 w-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
              Kaca<span className="text-blue-600">Meta</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Lihat Lebih Jelas. Tampil Lebih Tajam.
            </p>
            <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto">
              Koleksi kacamata premium dengan kualitas terbaik untuk gaya hidup modern Anda
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Icon icon="ph:eye-bold" className="mr-2 h-5 w-5" />
              Lihat Katalog
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 text-lg border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => sendWhatsApp()}
            >
              <Icon icon="ic:baseline-whatsapp" className="mr-2 h-5 w-5" />
              Chat di WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Katalog Produk */}
      <section id="katalog" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 mb-12">
            Katalog Produk
          </h2>

          {/* Filter Kategori */}
          <div className="mb-12">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
                <TabsTrigger value="semua">Semua</TabsTrigger>
                <TabsTrigger value="pria">Pria</TabsTrigger>
                <TabsTrigger value="wanita">Wanita</TabsTrigger>
                <TabsTrigger value="anak">Anak</TabsTrigger>
                <TabsTrigger value="anti-radiasi">Anti Radiasi</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Grid Produk */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                      <Icon icon="ph:glasses-bold" className="h-20 w-20 text-blue-400" />
                    </div>
                    {product.badge && (
                      <Badge className="absolute top-3 left-3 bg-blue-600">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 text-slate-900">
                    {product.name}
                  </CardTitle>
                  <p className="text-2xl font-bold text-blue-600">
                    {product.price}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => sendWhatsApp(product.name)}
                  >
                    <Icon icon="ic:baseline-whatsapp" className="mr-2 h-4 w-4" />
                    Pesan via WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bubble Chat WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => sendWhatsApp()}
        >
          <Icon icon="ic:baseline-whatsapp" className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Icon icon="ph:glasses-bold" className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">KacaMeta</span>
              </div>
              <p className="text-slate-400">
                Toko kacamata online terpercaya dengan koleksi premium dan pelayanan terbaik.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Kontak</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon icon="ic:baseline-whatsapp" className="h-5 w-5 text-green-400" />
                  <span className="text-slate-400">+62 812-3456-7890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon icon="ic:baseline-email" className="h-5 w-5 text-blue-400" />
                  <span className="text-slate-400">info@kacameta.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <Icon icon="ic:baseline-facebook" className="h-6 w-6 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors" />
                <Icon icon="mdi:instagram" className="h-6 w-6 text-pink-400 hover:text-pink-300 cursor-pointer transition-colors" />
                <Icon icon="ic:baseline-whatsapp" className="h-6 w-6 text-green-400 hover:text-green-300 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 KacaMeta. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
