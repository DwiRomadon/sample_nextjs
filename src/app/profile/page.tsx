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
import { User, Mail, Shield, Calendar, Edit, Save, X } from "lucide-react";

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
    update: any;
  };

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
      setOriginalName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: "Profil berhasil diperbarui" });
        setIsEditing(false);
        setOriginalName(name.trim());

        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: name.trim(),
          },
        });
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Gagal memperbarui profil",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(originalName);
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Memuat..." />
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
                  {message.text && (
                    <div
                      className={`p-3 rounded-md ${
                        message.type === "success"
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing || isLoading}
                          placeholder="Masukkan nama lengkap"
                        />
                        {!isEditing ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              onClick={handleUpdateProfile}
                              disabled={isLoading || !name.trim()}
                              size="icon"
                            >
                              {isLoading ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Alamat Email</Label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role Akun</Label>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Shield className="h-4 w-4 text-gray-600" />
                        <span className="capitalize text-sm font-medium">
                          {session.user.role.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
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
