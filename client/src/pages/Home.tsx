import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  QrCode,
  User,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  Video,
  Briefcase,
  Music,
  MessageCircle,
  Wifi,
  Ticket,
  Package,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";

const QR_TYPES = [
  { id: "vcard", label: "vCard", icon: User, description: "مشاركة بطاقة العمل" },
  { id: "url", label: "الروابط", icon: LinkIcon, description: "مشاركة روابط متعددة" },
  { id: "pdf", label: "PDF", icon: FileText, description: "عرض ملف PDF" },
  { id: "image", label: "الصور", icon: ImageIcon, description: "مشاركة صور متعددة" },
  { id: "video", label: "الفيديو", icon: Video, description: "عرض فيديو" },
  { id: "business", label: "الأعمال", icon: Briefcase, description: "مشاركة المعلومات حول مشاريك" },
  { id: "mp3", label: "MP3", icon: Music, description: "مشاركة ملف صوتي" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, description: "الحصول على رسائل واتساب" },
  { id: "wifi", label: "الواي فاي", icon: Wifi, description: "الاتصال بشبكة الواي فاي" },
  { id: "coupon", label: "قسيمة", icon: Ticket, description: "مشاركة قسيمة" },
  { id: "app", label: "التطبيقات", icon: Package, description: "إعادة التوجيه إلى متجر التطبيقات" },
  { id: "menu", label: "القائمة", icon: UtensilsCrossed, description: "إنشاء قائمة مطعم" },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16" />}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
          <p className="text-gray-600 mb-8 text-lg">
            قم بإنشاء رموز QR احترافية لمختلف أنواع المحتوى بسهولة
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <p className="text-gray-600">اختر نوع رمز QR الذي تريد إنشاءه</p>
        </div>

        {/* QR Type Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {QR_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedType === type.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => {
                  setSelectedType(type.id);
                  setLocation(`/generator/${type.id}`);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{type.label}</CardTitle>
                      <CardDescription className="text-xs">{type.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* My QR Codes Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">رموز QR الخاصة بي</h2>
          <MyQRCodes />
        </div>
      </div>
    </div>
  );
}

function MyQRCodes() {
  const { data: qrCodes, isLoading } = trpc.qrCode.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (!qrCodes || qrCodes.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">لم تقم بإنشاء أي رموز QR حتى الآن</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {qrCodes.map((qr) => (
        <Card key={qr.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{qr.name}</CardTitle>
            <CardDescription>{qr.type}</CardDescription>
          </CardHeader>
          <CardContent>
            {qr.qrDataUrl && (
              <img src={qr.qrDataUrl} alt={qr.name} className="w-full h-auto mb-4" />
            )}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">عدد المسحات</p>
                  <p className="font-semibold text-lg text-blue-600">{qr.scanCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">التحميلات</p>
                  <p className="font-semibold text-lg text-green-600">{qr.downloadCount || 0}</p>
                </div>
              </div>
              {qr.lastScannedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  آخر مسح: {new Date(qr.lastScannedAt).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                تحميل
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                مشاركة
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
