"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

interface Stats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalOrders: number;
  orderGrowth: string;
  thisWeekOrders: number;
  topCategories: Array<{
    id: number;
    name: string;
    _count: { products: number };
  }>;
  recentActivities: RecentActivity[];
}

interface RecentActivity {
  id: number;
  type: 'order' | 'product' | 'stock';
  message: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        toast.error('Gagal memuat statistik');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return "ph:shopping-cart-bold";
      case 'product': return "ph:package-bold";
      case 'stock': return "ph:warning-bold";
      default: return "ph:bell-bold";
    }
  };

  const getActivityColor = (status?: string) => {
    switch (status) {
      case 'success': return "text-green-600";
      case 'warning': return "text-yellow-600";
      case 'error': return "text-red-600";
      default: return "text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Custom Header for Admin */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1"/>
        <div className="flex flex-1 items-center gap-2">
          <Icon icon="ph:chart-line-bold" className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Dashboard Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <Icon icon="ph:sign-out-bold" className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
            {/* Header Section */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Dashboard KacaMeta</h1>
                  <p className="text-slate-600">Selamat datang! Berikut ringkasan bisnis Anda hari ini</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/admin/products')}
                    className="hidden sm:flex"
                  >
                    <Icon icon="ph:package-bold" className="mr-2 h-4 w-4" />
                    Kelola Produk
                  </Button>
                  <Button 
                    onClick={() => router.push('/admin/categories')}
                    className="bg-blue-600 hover:bg-blue-700 hidden sm:flex"
                  >
                    <Icon icon="ph:tag-bold" className="mr-2 h-4 w-4" />
                    Kelola Kategori
                  </Button>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="px-4 lg:px-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Icon icon="ph:shopping-cart-bold" className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pesanan Minggu Ini</p>
                          <p className="text-xs text-muted-foreground">vs minggu lalu</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{stats?.thisWeekOrders || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          {stats?.orderGrowth ? `${parseFloat(stats.orderGrowth) > 0 ? '+' : ''}${stats.orderGrowth}%` : 'N/A'}
                        </p>
                      </div>
                    </div> */}

                    <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Icon icon="ph:package-bold" className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Produk Aktif</p>
                          <p className="text-xs text-muted-foreground">Status tersedia</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {stats ? stats.totalProducts - stats.outOfStockProducts : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">dari {stats?.totalProducts || 0} total</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100">
                          <Icon icon="ph:tag-bold" className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Kategori</p>
                          <p className="text-xs text-muted-foreground">Total kategori</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{stats?.totalCategories || 0}</p>
                        <p className="text-xs text-muted-foreground">kategori aktif</p>
                      </div>
                    </div>
                  </div>
            </div>

            {/* Statistics Cards with Integrated Actions */}
            <div className="px-4 lg:px-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Products Card */}
                <Card className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                    <Icon icon="mdi:glasses" className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                    <p className="text-xs text-muted-foreground mb-3">Semua kategori</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push('/admin/products')}
                    >
                      <Icon icon="ph:package-bold" className="mr-2 h-4 w-4" />
                      Kelola Produk
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Categories Card */}
                <Card className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
                    <Icon icon="ph:tag-bold" className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
                    <p className="text-xs text-muted-foreground mb-3">Kategori aktif</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/admin/categories')}
                    >
                      <Icon icon="ph:tag-bold" className="mr-2 h-4 w-4" />
                      Kelola Kategori
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Orders Card */}
                {/* <Card className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                    <Icon icon="ph:shopping-cart-bold" className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {stats?.orderGrowth ? `${stats.orderGrowth}% vs minggu lalu` : 'Semua pesanan'}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/admin/orders')}
                    >
                      <Icon icon="ph:shopping-cart-bold" className="mr-2 h-4 w-4" />
                      Lihat Pesanan
                    </Button>
                  </CardContent>
                </Card> */}
                
                {/* Stock Overview Card */}
                <Card className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
                    <Icon icon="ph:package-bold" className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStock || 0}</div>
                    <p className="text-xs text-muted-foreground mb-3">Unit tersedia</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/admin/products?tab=stock')}
                    >
                      <Icon icon="ph:eye-bold" className="mr-2 h-4 w-4" />
                      Lihat Stok
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Stock Alert Cards */}
            {(stats?.lowStockProducts || stats?.outOfStockProducts) && (
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {stats?.lowStockProducts > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50 hover:shadow-lg transition-all duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800">Stok Rendah</CardTitle>
                        <Icon icon="ph:warning-bold" className="h-4 w-4 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-700">{stats.lowStockProducts}</div>
                        <p className="text-xs text-yellow-600 mb-3">Produk perlu perhatian</p>
                        <Button 
                          size="sm" 
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => router.push('/admin/products?status=LOW_STOCK')}
                        >
                          <Icon icon="ph:warning-bold" className="mr-2 h-4 w-4" />
                          Lihat Produk
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                  
                  {stats?.outOfStockProducts > 0 && (
                    <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-all duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Habis Stok</CardTitle>
                        <Icon icon="ph:x-circle-bold" className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-700">{stats.outOfStockProducts}</div>
                        <p className="text-xs text-red-600 mb-3">Produk perlu restok</p>
                        <Button 
                          size="sm" 
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => router.push('/admin/products?status=OUT_OF_STOCK')}
                        >
                          <Icon icon="ph:x-circle-bold" className="mr-2 h-4 w-4" />
                          Lihat Produk
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Analytics & Insights */}
            <div className="px-4 lg:px-6">
              <div className="grid gap-4 lg:grid-cols-3">
                
                {/* Recent Activities */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="ph:clock-bold" className="h-5 w-5" />
                      Aktivitas Terbaru
                    </CardTitle>
                    <CardDescription>Pembaruan sistem dan aktivitas bisnis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                        stats.recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className={`p-2 rounded-full bg-white ${getActivityColor(activity.status)}`}>
                              <Icon icon={getActivityIcon(activity.type)} className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                              <p className="text-xs text-slate-500">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="ph:clock-bold" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">Belum ada aktivitas terbaru</p>
                        </div>
                      )}
                    </div>
                    {stats?.recentActivities && stats.recentActivities.length > 0 && (
                      <Button variant="outline" className="w-full mt-4">
                        <Icon icon="ph:list-bold" className="mr-2 h-4 w-4" />
                        Lihat Semua Aktivitas
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Top Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon icon="ph:chart-bar-bold" className="h-5 w-5" />
                      Kategori Terpopuler
                    </CardTitle>
                    <CardDescription>Berdasarkan jumlah produk</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.topCategories && stats.topCategories.length > 0 ? (
                        stats.topCategories.map((category, index) => (
                          <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-blue-100">
                                <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground">{category._count.products} produk</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => router.push(`/admin/products?category=${category.id}`)}
                            >
                              <Icon icon="ph:arrow-right-bold" className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="ph:tag-bold" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">Belum ada kategori</p>
                        </div>
                      )}
                    </div>
                    {stats?.topCategories && stats.topCategories.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => router.push('/admin/categories')}
                      >
                        <Icon icon="ph:tag-bold" className="mr-2 h-4 w-4" />
                        Kelola Kategori
                      </Button>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}


