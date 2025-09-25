"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LayoutWithSidebar } from "@/components/layout-with-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { PageLoading } from "@/components/loading-spinner";

interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "USER";
  };
  expires: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };

  if (status === "loading") {
    return <PageLoading />;
  }

  if (!session) {
    redirect("/login");
  }

  // Mock data untuk dashboard
  const stats = [
    {
      label: "Total Projects",
      value: "12",
      change: "+2",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Tasks Completed",
      value: "48",
      change: "+8",
      icon: Activity,
      color: "green",
    },
    {
      label: "Team Members",
      value: "6",
      change: "+1",
      icon: Users,
      color: "purple",
    },
    {
      label: "Upcoming Events",
      value: "3",
      change: "-1",
      icon: Calendar,
      color: "orange",
    },
  ];

  const recentActivities = [
    {
      action: "Menyelesaikan project",
      time: "2 jam yang lalu",
      type: "success",
    },
    { action: "Mengupdate profil", time: "1 hari yang lalu", type: "info" },
    {
      action: "Bergabung dalam tim",
      time: "3 hari yang lalu",
      type: "success",
    },
  ];

  return (
    <LayoutWithSidebar user={session.user}>
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Selamat datang kembali, {session.user.name}!
              </p>
            </div>
            <Badge
              variant={session.user.role === "ADMIN" ? "default" : "secondary"}
              className="capitalize"
            >
              {session.user.role.toLowerCase()}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {stat.value}
                        </p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">
                            {stat.change} dari bulan lalu
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                        <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Aktivitas terbaru dalam akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "success"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Lihat Semua Aktivitas
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>
                  Tindakan yang dapat Anda lakukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Buat Project Baru
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Undang Anggota Tim
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Jadwalkan Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mulai menjelajahi fitur
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Temukan semua fitur yang tersedia untuk meningkatkan
                    produktivitas Anda.
                  </p>
                </div>
                <Button>
                  Jelajahi Fitur
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
