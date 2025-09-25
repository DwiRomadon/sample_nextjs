import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">403</CardTitle>
          <CardDescription className="text-xl">Akses Ditolak</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-gray-600">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">Kembali ke Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Masuk dengan Akun Lain</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
