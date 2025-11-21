import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Download,
  Share2,
  Trash2,
  Search,
  Loader2,
  QrCode,
} from "lucide-react";

export default function MyQRCodes() {
  const [, setLocation] = useLocation();
  const { data: qrCodes, isLoading } = trpc.qrCode.list.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const deleteQRCode = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الرمز؟")) {
      // TODO: Add delete mutation
      console.log("Delete QR Code:", id);
    }
  };

  const filteredQRCodes = qrCodes?.filter((qr) =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">رموزي</h1>
          </div>
          <p className="text-gray-600">إدارة جميع رموز QR الخاصة بك</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن رمز QR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* QR Codes Grid */}
        {filteredQRCodes.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="pt-12 text-center pb-12">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">لم تقم بإنشاء أي رموز QR حتى الآن</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation("/")}
              >
                إنشاء رمز QR جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{qr.name}</CardTitle>
                      <CardDescription>{qr.type}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* QR Code Image */}
                  {qr.qrDataUrl && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                      <img src={qr.qrDataUrl} alt={qr.name} className="w-full h-auto max-w-xs" />
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">المسحات</p>
                        <p className="font-bold text-lg text-blue-600">{qr.scanCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">التحميلات</p>
                        <p className="font-bold text-lg text-green-600">{qr.downloadCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">الحالة</p>
                        <p className="font-bold text-lg text-gray-600">نشط</p>
                      </div>
                    </div>
                    {qr.lastScannedAt && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        آخر مسح: {new Date(qr.lastScannedAt).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>

                  {/* Creation Date */}
                  <div className="mb-4 text-xs text-gray-500 text-center">
                    تم الإنشاء: {new Date(qr.createdAt).toLocaleDateString('ar-SA')}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        // TODO: Implement download
                        console.log("Download:", qr.id);
                      }}
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        // TODO: Implement share
                        console.log("Share:", qr.id);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      مشاركة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteQRCode(qr.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
