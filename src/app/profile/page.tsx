"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutWithSidebar } from "@/components/layout-with-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "USER";
  };
  expires: string;
}

export default function ProfilePage() {
  const {
    data: session,
    status,
    update,
  } = useSession() as {
    data: CustomSession | null;
    status: string;
    update: (data?: any) => Promise<any>;
  };

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [originalName, setOriginalName] = useState("");

  // Initialize form dengan data dari session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
      setOriginalName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!name.trim()) {
      setMessage({ type: "error", text: "Nama tidak boleh kosong" });
      return;
    }

    if (name.trim().length < 2) {
      setMessage({ type: "error", text: "Nama harus minimal 2 karakter" });
      return;
    }

    // Jika tidak ada perubahan
    if (name.trim() === originalName) {
      setMessage({ type: "error", text: "Tidak ada perubahan yang dilakukan" });
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update session secara manual - FIX: Gunakan update dari useSession
        await update({
          user: {
            name: name.trim(),
          },
        });

        setMessage({
          type: "success",
          text: "Profil berhasil diperbarui",
        });
        setIsEditing(false);
        setOriginalName(name.trim());

        // Auto-clear success message setelah 3 detik
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        throw new Error(data.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Terjadi kesalahan jaringan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(originalName);
    setIsEditing(false);
    setMessage(null);
  };

  const handleStartEdit = () => {
    setMessage(null);
    setIsEditing(true);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Memuat profil..." />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <LayoutWithSidebar user={session.user}>
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Saya</h1>
              <p className="text-gray-600 mt-1">Kelola informasi profil Anda</p>
            </div>
            <Badge
              variant={session.user.role === "ADMIN" ? "default" : "secondary"}
              className="capitalize"
            >
              <Shield className="h-3 w-3 mr-1" />
              {session.user.role.toLowerCase()}
            </Badge>
          </div>

          {/* Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>
                    Perbarui informasi profil dan preferensi akun Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Message Alert */}
                  {message && (
                    <div
                      className={`p-4 rounded-md border ${
                        message.type === "success"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <div className="flex items-center">
                        {message.type === "success" ? (
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        <span className="font-medium">{message.text}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nama Lengkap
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Masukkan nama lengkap"
                            className="flex-1"
                          />
                          {!isEditing ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleStartEdit}
                              size="icon"
                              className="flex-shrink-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="flex space-x-2 flex-shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isLoading}
                                size="icon"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <p className="text-xs text-gray-500">
                            {name.trim().length < 2
                              ? "Minimal 2 karakter"
                              : "Tekan save untuk menyimpan"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Alamat Email
                        </Label>
                        <Input
                          id="email"
                          value={session.user.email || ""}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">
                          Email tidak dapat diubah
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Role Akun</Label>
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                          <Shield className="h-4 w-4 text-gray-600" />
                          <span className="capitalize text-sm font-medium">
                            {session.user.role.toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Status Akun</Label>
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">
                            Aktif
                          </span>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button
                          type="submit"
                          disabled={
                            isLoading ||
                            !name.trim() ||
                            name.trim() === originalName
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span className="ml-2">Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Simpan Perubahan
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Batal
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Info Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Terverifikasi
                      </span>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        Ya
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Member sejak
                      </span>
                      <span className="text-gray-900 font-medium">
                        {new Date().toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    Ubah Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    Preferensi Notifikasi
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    Download Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>
                Kelola pengaturan keamanan untuk melindungi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Password</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Terakhir diubah 3 bulan yang lalu
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Ubah Password
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sesi Aktif
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      1 perangkat aktif
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Lihat Semua Sesi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
