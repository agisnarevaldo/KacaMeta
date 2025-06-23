"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import ChatHybrid from "@/components/chat-hybrid"; // Hybrid solution

// Type definitions based on Prisma schema
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  badge?: string;
  images?: string;
  category: Category;
}

export default function Home() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("semua");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890"); // Default fallback
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper function to get the first image from images field
  const getFirstImage = (images: string | null | undefined): string | null => {
    if (!images) return null;
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return images; // If not JSON, treat as single image URL
    } catch {
      // If JSON parse fails, treat as single image URL
      return images;
    }
  };

  // Helper function to validate image URL
  const isValidImageUrl = (url: string | null | undefined): url is string => {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return false;
    }
    try {
      // Check if it's a valid URL format
      new URL(url, window.location.origin);
      return true;
    } catch {
      // If not a valid URL, check if it's a valid relative path
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
    }
  };

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, whatsappRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/whatsapp-config')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories);
      }

      if (whatsappRes.ok) {
        const whatsappData = await whatsappRes.json();
        setWhatsappNumber(whatsappData.whatsappNumber);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    (activeCategory === "semua" || product.category.slug === activeCategory) &&
    product.status !== 'DISCONTINUED' // Hide discontinued products from customers
  );
  
  const sendWhatsApp = (productName?: string) => {
    const message = productName 
      ? `Halo! Saya tertarik dengan ${productName}. Bisa info lebih lanjut?`
      : "Halo! Saya ingin melihat katalog kacamata KacaMeta.";
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:glasses" className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-slate-600">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar Sticky */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Icon icon="mdi:glasses" className="h-8 w-8 text-blue-600" />
              <span className="text-xl sm:text-2xl font-bold text-slate-900">KacaMeta</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#beranda" className="text-slate-700 hover:text-blue-600 transition-colors">Beranda</a>
              <a href="#katalog" className="text-slate-700 hover:text-blue-600 transition-colors">Katalog</a>
              <a href="/admin" className="text-slate-700 hover:text-blue-600 transition-colors">Admin</a>
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <Icon 
                  icon={isMobileMenuOpen ? "ph:x-bold" : "ph:list-bold"} 
                  className="h-6 w-6" 
                />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-3">
                <a 
                  href="#beranda" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Beranda
                </a>
                <a 
                  href="#katalog" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Katalog
                </a>
                <a 
                  href="/admin" 
                  className="block text-slate-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </a>
                <Button 
                  onClick={() => {
                    sendWhatsApp();
                    setIsMobileMenuOpen(false);
                  }} 
                  variant="outline" 
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 mt-4"
                >
                  <Icon icon="ic:baseline-whatsapp" className="h-4 w-4" />
                  Chat WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <Icon icon="ph:glasses-bold" className="h-16 sm:h-20 w-16 sm:w-20 text-blue-600 mx-auto mb-4 sm:mb-6" />
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Kaca<span className="text-blue-600">Meta</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Lihat Lebih Jelas. Tampil Lebih Tajam.
            </p>
            <p className="text-base sm:text-lg text-slate-500 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Koleksi kacamata premium dengan kualitas terbaik untuk gaya hidup modern Anda
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg bg-blue-600 hover:bg-blue-700"
              onClick={() => document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Icon icon="ph:eye-bold" className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Lihat Katalog
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => sendWhatsApp()}
            >
              <Icon icon="ic:baseline-whatsapp" className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              Chat di WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Katalog Produk */}
      <section id="katalog" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-slate-900 mb-8 sm:mb-12">
            Katalog Produk
          </h2>

          {/* Filter Kategori */}
          <div className="mb-8 sm:mb-12">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full max-w-full sm:max-w-2xl mx-auto overflow-x-auto" style={{ gridTemplateColumns: `repeat(${categories.length + 1}, minmax(80px, 1fr))` }}>
                <TabsTrigger value="semua" className="text-xs sm:text-sm px-2 sm:px-4">Semua</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.slug} className="text-xs sm:text-sm px-2 sm:px-4">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Grid Produk - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const firstImage = getFirstImage(product.images);
              return (
              <Card 
                key={product.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}
              >
                <CardHeader className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    {isValidImageUrl(firstImage) ? (
                      <Image 
                        src={firstImage} 
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center ${isValidImageUrl(firstImage) ? 'hidden' : ''}`}>
                      <Icon icon="ph:glasses-bold" className="h-16 sm:h-20 w-16 sm:w-20 text-blue-400" />
                    </div>
                    {product.badge && (
                      <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-600 text-xs">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline"
                    className="w-full sm:flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product.slug}`);
                    }}
                  >
                    <Icon icon="ph:eye-bold" className="mr-2 h-4 w-4" />
                    Detail
                  </Button>
                  <Button 
                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendWhatsApp(product.name);
                    }}
                  >
                    <Icon icon="ic:baseline-whatsapp" className="mr-2 h-4 w-4" />
                    Pesan
                  </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Bubble Chat WhatsApp */}
      {/* <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => sendWhatsApp()}
        >
          <Icon icon="ic:baseline-whatsapp" className="h-6 w-6 text-white" />
        </Button>
      </div> */}

      {/* Chat System - Botpress with WhatsApp fallback */}
      <ChatHybrid />
      

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                <Icon icon="ph:glasses-bold" className="h-6 sm:h-8 w-6 sm:w-8 text-blue-400" />
                <span className="text-xl sm:text-2xl font-bold">KacaMeta</span>
              </div>
              <p className="text-slate-400 text-sm sm:text-base">
                Toko kacamata online terpercaya dengan koleksi premium dan pelayanan terbaik.
              </p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Kontak</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Icon icon="ic:baseline-whatsapp" className="h-4 sm:h-5 w-4 sm:w-5 text-green-400" />
                  <span className="text-slate-400 text-sm sm:text-base">+62 812-3456-7890</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Icon icon="ic:baseline-email" className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
                  <span className="text-slate-400 text-sm sm:text-base">info@kacameta.com</span>
                </div>
              </div>
            </div>
            
            <div className="text-center sm:text-left lg:text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Ikuti Kami</h3>
              <div className="flex justify-center sm:justify-start lg:justify-center space-x-4">
                <Icon icon="ic:baseline-facebook" className="h-5 sm:h-6 w-5 sm:w-6 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors" />
                <Icon icon="mdi:instagram" className="h-5 sm:h-6 w-5 sm:w-6 text-pink-400 hover:text-pink-300 cursor-pointer transition-colors" />
                <Icon icon="ic:baseline-whatsapp" className="h-5 sm:h-6 w-5 sm:w-6 text-green-400 hover:text-green-300 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-slate-400 text-sm sm:text-base">
              © 2024 KacaMeta. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
