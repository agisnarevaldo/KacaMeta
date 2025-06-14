"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

// Type definitions based on Prisma schema
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  badge?: string;
  images?: string;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    status: "AVAILABLE",
    badge: ""
  });

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/products?includeDiscontinued=true'), // Include discontinued products in admin
        fetch('/api/categories'),
        fetch('/api/admin/stats')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category.slug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Add new product
  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts([data.product, ...products]);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          stock: "",
          categoryId: "",
          status: "AVAILABLE",
          badge: ""
        });
        setIsAddDialogOpen(false);
        toast.success('Produk berhasil ditambahkan');
        fetchData(); // Refresh stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menambahkan produk');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Gagal menambahkan produk');
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          stock: editingProduct.stock,
          categoryId: editingProduct.categoryId,
          status: editingProduct.status,
          badge: editingProduct.badge
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        toast.success('Produk berhasil diupdate');
        fetchData(); // Refresh stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengupdate produk');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Gagal mengupdate produk');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini? Jika produk pernah dipesan, lebih baik mengubah status menjadi "Discontinued".')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast.success('Produk berhasil dihapus');
        fetchData(); // Refresh stats
      } else {
        const error = await response.json();
        if (error.error.includes('has been ordered')) {
          // If product can't be deleted because it has been ordered, offer to discontinue
          if (confirm('Produk tidak dapat dihapus karena pernah dipesan. Apakah Anda ingin mengubah status menjadi "Discontinued" saja?')) {
            handleDiscontinueProduct(id);
          }
        } else {
          toast.error(error.error || 'Gagal menghapus produk');
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  // Discontinue product instead of deleting
  const handleDiscontinueProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DISCONTINUED'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(products.map(p => p.id === id ? data.product : p));
        toast.success('Produk berhasil diubah menjadi discontinued');
        fetchData(); // Refresh stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengubah status produk');
      }
    } catch (error) {
      console.error('Error discontinuing product:', error);
      toast.error('Gagal mengubah status produk');
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "bg-green-500";
      case "LOW_STOCK": return "bg-yellow-500";
      case "OUT_OF_STOCK": return "bg-red-500";
      case "DISCONTINUED": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "Tersedia";
      case "LOW_STOCK": return "Stok Rendah";
      case "OUT_OF_STOCK": return "Habis";
      case "DISCONTINUED": return "Discontinued";
      default: return status;
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        {/* Custom Header for Admin */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1"/>
          <div className="flex flex-1 items-center gap-2">
            <Icon icon="ph:glasses-bold" className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name} ({session?.user?.role})
            </span>
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
                    <p className="text-slate-600">Kelola produk kacamata Anda</p>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Icon icon="ph:plus-bold" className="mr-2 h-4 w-4" />
                        Tambah Produk
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Tambah Produk Baru</DialogTitle>
                        <DialogDescription>
                          Tambahkan produk kacamata baru ke katalog Anda.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Nama Produk</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            placeholder="Masukkan nama produk"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Deskripsi</Label>
                          <Input
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            placeholder="Masukkan deskripsi produk"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="price">Harga</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stock">Stok</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="categoryId">Kategori</Label>
                          <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={newProduct.status} onValueChange={(value) => setNewProduct({...newProduct, status: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                                <SelectItem value="LOW_STOCK">Stok Rendah</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Habis</SelectItem>
                                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="badge">Badge</Label>
                            <Input
                              id="badge"
                              value={newProduct.badge}
                              onChange={(e) => setNewProduct({...newProduct, badge: e.target.value})}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleAddProduct} disabled={!newProduct.name || !newProduct.price || !newProduct.categoryId}>
                          Tambah Produk
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                      <Icon icon="ph:glasses-bold" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                      <p className="text-xs text-muted-foreground">Semua kategori</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
                      <Icon icon="ph:package-bold" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalStock || 0}</div>
                      <p className="text-xs text-muted-foreground">Unit tersedia</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
                      <Icon icon="ph:warning-bold" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats?.lowStockProducts || 0}</div>
                      <p className="text-xs text-muted-foreground">Kurang dari 10 unit</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Habis Stok</CardTitle>
                      <Icon icon="ph:x-circle-bold" className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats?.outOfStockProducts || 0}</div>
                      <p className="text-xs text-muted-foreground">Perlu restok</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Product Management */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manajemen Produk</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="max-w-sm">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Badge</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category.name}</TableCell>
                            <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(product.status)}>
                                {getStatusText(product.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.badge && (
                                <Badge variant="outline">{product.badge}</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Icon icon="ph:trash-bold" className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Update informasi produk kacamata.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Produk</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Masukkan nama produk"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Input
                  id="edit-description"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  placeholder="Masukkan deskripsi produk"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Harga</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stok</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryId">Kategori</Label>
                <Select value={editingProduct.categoryId.toString()} onValueChange={(value) => setEditingProduct({...editingProduct, categoryId: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingProduct.status} onValueChange={(value) => setEditingProduct({...editingProduct, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                      <SelectItem value="LOW_STOCK">Stok Rendah</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Habis</SelectItem>
                      <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-badge">Badge</Label>
                  <Input
                    id="edit-badge"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, badge: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}