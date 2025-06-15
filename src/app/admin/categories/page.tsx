"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        toast.error('Gagal memuat data kategori');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        toast.error('Nama kategori harus diisi');
        return;
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast.success('Kategori berhasil ditambahkan');
        setShowAddDialog(false);
        setNewCategory({ name: '', description: '' });
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menambahkan kategori');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Terjadi kesalahan saat menambahkan kategori');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name,
          description: editingCategory.description,
        }),
      });

      if (response.ok) {
        toast.success('Kategori berhasil diperbarui');
        setShowEditDialog(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui kategori');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Terjadi kesalahan saat memperbarui kategori');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category._count && category._count.products > 0) {
      toast.error('Tidak dapat menghapus kategori yang masih memiliki produk');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Terjadi kesalahan saat menghapus kategori');
    }
  };

  return (
    <>
      {/* Custom Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1"/>
        <div className="flex flex-1 items-center gap-2">
          <Icon icon="ph:tag-bold" className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Manajemen Kategori</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="ph:tag-bold" className="h-6 w-6" />
                    Manajemen Kategori
                  </CardTitle>
                  <CardDescription>
                    Kelola kategori produk kacamata
                  </CardDescription>
                  <div className="flex justify-end">
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Icon icon="ph:plus-bold" className="mr-2 h-4 w-4" />
                          Tambah Kategori
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Kategori Baru</DialogTitle>
                          <DialogDescription>
                            Masukkan informasi kategori baru
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                              id="name"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              placeholder="Masukkan nama kategori"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Input
                              id="description"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                              placeholder="Masukkan deskripsi kategori (opsional)"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Batal
                          </Button>
                          <Button onClick={handleAddCategory}>
                            Tambah Kategori
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Icon icon="ph:spinner-bold" className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Kategori</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Jumlah Produk</TableHead>
                          <TableHead>Dibuat</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{category.slug}</Badge>
                            </TableCell>
                            <TableCell>
                              {category.description || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Icon icon="ph:package-bold" className="h-4 w-4 text-muted-foreground" />
                                {category._count?.products || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(category.createdAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={category._count && category._count.products > 0}
                                >
                                  <Icon icon="ph:trash-bold" className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {categories.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <Icon icon="ph:folder-open-bold" className="h-12 w-12" />
                                <p>Belum ada kategori</p>
                                <p className="text-sm">Tambahkan kategori pertama Anda</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>
              Perbarui informasi kategori
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Kategori</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Input
                  id="edit-description"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={editingCategory.slug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Slug otomatis dibuat dari nama kategori dan tidak dapat diubah
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEditCategory}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
