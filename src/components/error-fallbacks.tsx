import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, FileQuestion, Server, UserX } from "lucide-react";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function NotFoundError({
  title = "Halaman Tidak Ditemukan",
  message = "Halaman yang Anda cari tidak ada.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <FileQuestion className="h-16 w-16 mx-auto text-gray-400" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry}>Kembali ke Beranda</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ServerError({
  title = "Kesalahan Server",
  message = "Terjadi masalah dengan server. Silakan coba lagi nanti.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Server className="h-16 w-16 mx-auto text-red-400" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry}>Coba Lagi</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuthError({
  title = "Akses Ditolak",
  message = "Anda tidak memiliki izin untuk mengakses halaman ini.",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <UserX className="h-16 w-16 mx-auto text-orange-400" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry}>Masuk dengan Akun Lain</Button>
        </CardContent>
      </Card>
    </div>
  );
}
