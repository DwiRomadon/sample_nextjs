"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutWithSidebar } from "@/components/layout-with-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LoadingSpinner,
  PageLoading,
  CardLoading,
} from "@/components/loading-spinner";
import {
  AlertCircle,
  Users,
  UserCheck,
  User as UserIcon,
  Trash2,
  Search,
  Shield,
  RefreshCw,
  Download,
  Database,
  FileText,
  Plus,
} from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "USER";
  };
  expires: string;
}

interface ApiError {
  message: string;
  status?: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    activeToday: 0,
  });

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [session]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    // Update stats when users change
    const today = new Date().toDateString();
    const activeTodayCount = users.filter(
      (user) => new Date(user.updatedAt).toDateString() === today
    ).length;

    setStats({
      total: users.length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      users: users.filter((user) => user.role === "USER").length,
      activeToday: activeTodayCount,
    });
  }, [users]);

  const fetchUsers = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Silakan login kembali");
        } else if (response.status === 403) {
          throw new Error("Forbidden - Anda tidak memiliki akses");
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError({
        message:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat data",
        status: err instanceof Error ? 500 : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus user ${userEmail}? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(userId);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: Gagal menghapus user`
        );
      }

      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError({
        message:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menghapus user",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRetry = () => {
    fetchUsers();
  };

  const handleCreateUser = () => {
    router.push("/admin/users/create");
  };

  const handleExportData = () => {
    // Simple export functionality
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Nama,Email,Role,Tanggal Daftar\n" +
      users
        .map(
          (user) =>
            `"${user.id}","${user.name || "N/A"}","${user.email}","${
              user.role
            }","${new Date(user.createdAt).toLocaleDateString("id-ID")}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "ADMIN" ? "default" : "secondary";
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? Shield : UserIcon;
  };

  // Show loading while checking session
  if (status === "loading") {
    return <PageLoading />;
  }

  // Redirect if not admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/unauthorized");
  }

  return (
    <LayoutWithSidebar user={session.user}>
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Selamat datang,{" "}
                <span className="font-semibold text-blue-600">
                  {session.user.name}
                </span>
                ! Kelola sistem dan pengguna dengan mudah.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCreateUser}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah User</span>
              </Button>
              <Button
                onClick={handleExportData}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium">
                      Terjadi Kesalahan
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{error.message}</p>
                    {error.status && (
                      <p className="text-red-600 text-xs mt-1">
                        Kode Error: {error.status}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Coba Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.total}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Semua pengguna terdaftar
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Admin Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.admins}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Pengguna dengan akses admin
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Regular Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.users}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pengguna biasa</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <UserIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Aktif Hari Ini
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.activeToday}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      User yang aktif hari ini
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table Section */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Manajemen Users</span>
                  </CardTitle>
                  <CardDescription>
                    Kelola semua user yang terdaftar dalam sistem
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <CardLoading />
                  <CardLoading />
                  <CardLoading />
                </div>
              ) : (
                <>
                  {/* Summary Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <p className="text-sm text-gray-600">
                      Menampilkan{" "}
                      <span className="font-semibold">
                        {filteredUsers.length}
                      </span>{" "}
                      dari <span className="font-semibold">{users.length}</span>{" "}
                      user
                      {searchTerm && ` untuk pencarian "${searchTerm}"`}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Clear Pencarian
                      </Button>
                    )}
                  </div>

                  {/* Users Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">
                            User Info
                          </TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">
                            Tanggal Daftar
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-12"
                            >
                              <div className="flex flex-col items-center space-y-3">
                                <Users className="h-12 w-12 text-gray-300" />
                                <div>
                                  <p className="text-gray-500 font-medium">
                                    {searchTerm
                                      ? "User tidak ditemukan"
                                      : "Belum ada user terdaftar"}
                                  </p>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm
                                      ? "Coba gunakan kata kunci lain atau clear pencarian"
                                      : "User yang mendaftar akan muncul di sini"}
                                  </p>
                                </div>
                                {!searchTerm && (
                                  <Button
                                    onClick={handleCreateUser}
                                    className="mt-2"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah User Pertama
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => {
                            const RoleIcon = getRoleIcon(user.role);
                            return (
                              <TableRow
                                key={user.id}
                                className="hover:bg-gray-50/50 group"
                              >
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-semibold text-xs">
                                        {user.name?.charAt(0).toUpperCase() ||
                                          user.email?.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {user.name || "Tidak ada nama"}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        ID: {user.id.substring(0, 8)}...
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {user.email}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={getRoleBadgeVariant(user.role)}
                                    className="capitalize flex items-center space-x-1 w-fit"
                                  >
                                    <RoleIcon className="h-3 w-3" />
                                    <span>{user.role.toLowerCase()}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p>
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleDateString("id-ID")}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleTimeString("id-ID")}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        deleteUser(user.id, user.email)
                                      }
                                      disabled={
                                        user.id === session.user.id ||
                                        deleteLoading === user.id ||
                                        isLoading
                                      }
                                      className="disabled:opacity-50"
                                    >
                                      {deleteLoading === user.id ? (
                                        <LoadingSpinner size="sm" />
                                      ) : (
                                        <>
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Hapus
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Info */}
                  {filteredUsers.length > 0 && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                      <p>
                        Menampilkan {Math.min(filteredUsers.length, 10)} user
                        dari total {filteredUsers.length}
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          Sebelumnya
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & System Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Tindakan cepat untuk mengelola sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    View System Logs
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>Status sistem dan performa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Database Status
                    </span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">API Response</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm font-medium">64%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
