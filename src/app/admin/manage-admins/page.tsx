"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Admin {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export default function ManageAdmins() {
  const { data: session } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'ADMIN'
  });

  // Check if user is Super Admin
  useEffect(() => {
    if (session && session.user?.role !== 'SUPER_ADMIN') {
      router.push('/admin');
      toast.error('Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.');
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchAdmins();
    }
  }, [session]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins);
      } else {
        toast.error('Gagal memuat data admin');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      if (!newAdmin.name || !newAdmin.username || !newAdmin.email || !newAdmin.password) {
        toast.error('Semua field harus diisi');
        return;
      }

      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin),
      });

      if (response.ok) {
        toast.success('Admin berhasil ditambahkan');
        setShowAddDialog(false);
        setNewAdmin({ name: '', username: '', email: '', password: '', role: 'ADMIN' });
        fetchAdmins();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menambahkan admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Terjadi kesalahan saat menambahkan admin');
    }
  };

  const handleEditAdmin = async () => {
    if (!editingAdmin) return;

    try {
      const response = await fetch(`/api/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingAdmin.name,
          username: editingAdmin.username,
          email: editingAdmin.email,
          role: editingAdmin.role,
        }),
      });

      if (response.ok) {
        toast.success('Admin berhasil diperbarui');
        setShowEditDialog(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal memperbarui admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Terjadi kesalahan saat memperbarui admin');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus admin ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Admin berhasil dihapus');
        fetchAdmins();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menghapus admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Terjadi kesalahan saat menghapus admin');
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'SUPER_ADMIN' ? (
      <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
    );
  };

  if (session?.user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <>
      {/* Custom Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center gap-2">
          <Icon icon="ph:users-bold" className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Manajemen Admin</span>
        </div>
      </header>
      <Card className="border-none shadow-none">
        <CardHeader className="flex justify-between items-center">
          <div className="">
            Kelola admin yang dapat mengakses dashboard
          </div>
          <CardDescription>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Icon icon="ph:plus-bold" className="mr-2 h-4 w-4" />
                    Tambah Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tambah Admin Baru</DialogTitle>
                    <DialogDescription>
                      Masukkan informasi admin baru
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                        placeholder="Masukkan username"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Masukkan email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Masukkan password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddAdmin}>
                      Tambah Admin
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </CardDescription>

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
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{getRoleBadge(admin.role)}</TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAdmin(admin);
                            setShowEditDialog(true);
                          }}
                        >
                          <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                        </Button>
                        {admin.id !== Number(session?.user?.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon icon="ph:trash-bold" className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Admin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Perbarui informasi admin
            </DialogDescription>
          </DialogHeader>
          {editingAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nama Lengkap</Label>
                <Input
                  id="edit-name"
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editingAdmin.username}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingAdmin.role}
                  onValueChange={(value) => setEditingAdmin({ ...editingAdmin, role: value as 'ADMIN' | 'SUPER_ADMIN' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleEditAdmin}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}