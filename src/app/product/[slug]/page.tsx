"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";

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

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to get images array from images field
  const getImages = (images: string | null | undefined): string[] => {
    if (!images) return [];
    
    try {
      // Try to parse as JSON array first
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [images]; // If not JSON, treat as single image URL
    } catch {
      // If JSON parse fails, treat as single image URL
      return [images];
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

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?slug=${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.products.find((p: Product) => p.slug === slug);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // Product not found
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = "6281234567890";
  
  const sendWhatsApp = (productName: string) => {
    const message = `Halo! Saya tertarik dengan ${productName}. Bisa info lebih lanjut?`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500 hover:bg-green-500";
      case "LOW_STOCK": return "bg-yellow-500 hover:bg-yellow-500";
      case "OUT_OF_STOCK": return "bg-red-500 hover:bg-red-500";
      case "DISCONTINUED": return "bg-gray-500 hover:bg-gray-500";
      default: return "bg-gray-500 hover:bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Tersedia";
      case "LOW_STOCK": return "Stok Terbatas";
      case "OUT_OF_STOCK": return "Habis";
      case "DISCONTINUED": return "Tidak Tersedia";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Icon icon="ph:glasses-bold" className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-slate-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Icon icon="ph:warning-bold" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Produk tidak ditemukan</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const images = getImages(product.images);
  const validImages = images.filter(isValidImageUrl);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Icon icon="ph:glasses-bold" className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">KacaMeta</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <Icon icon="ph:arrow-left-bold" className="h-4 w-4" />
                Kembali
              </Button>
              <Button 
                onClick={() => sendWhatsApp(product.name)} 
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

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  {validImages.length > 0 ? (
                    <Image
                      src={validImages[currentImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-200 flex items-center justify-center">
                      <Icon icon="ph:glasses-bold" className="h-32 w-32 text-blue-400" />
                    </div>
                  )}
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 bg-blue-600">
                      {product.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Images */}
            {validImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {validImages.map((image, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer overflow-hidden transition-all duration-200 ${
                      currentImageIndex === index 
                        ? 'ring-2 ring-blue-600 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>{product.category.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <Badge className={getStatusColor(product.status)}>
                  {getStatusText(product.status)}
                </Badge>
              </div>
            </div>

            <Separator />

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Deskripsi</h3>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Detail Produk</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Kategori:</span>
                  <span className="font-medium text-slate-900">{product.category.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Stok:</span>
                  <span className="font-medium text-slate-900">{product.stock} unit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status:</span>
                  <Badge className={getStatusColor(product.status)}>
                    {getStatusText(product.status)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                onClick={() => sendWhatsApp(product.name)}
                disabled={product.status === 'OUT_OF_STOCK' || product.status === 'DISCONTINUED'}
              >
                <Icon icon="ic:baseline-whatsapp" className="mr-3 h-6 w-6" />
                {product.status === 'OUT_OF_STOCK' || product.status === 'DISCONTINUED' 
                  ? 'Tidak Tersedia' 
                  : 'Pesan via WhatsApp'
                }
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/')}
                  className="text-lg py-6"
                >
                  <Icon icon="ph:arrow-left-bold" className="mr-2 h-5 w-5" />
                  Kembali
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/#katalog')}
                  className="text-lg py-6"
                >
                  <Icon icon="ph:eye-bold" className="mr-2 h-5 w-5" />
                  Lihat Katalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bubble Chat WhatsApp */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => sendWhatsApp(product.name)}
        >
          <Icon icon="ic:baseline-whatsapp" className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
