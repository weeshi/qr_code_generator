import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Scan,
  History,
  Zap,
  Shield,
  BarChart3,
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

const FEATURES = [
  {
    icon: Zap,
    title: "سريع وسهل",
    description: "إنشاء رموز QR احترافية في ثوانٍ معدودة بدون الحاجة لمهارات تقنية",
  },
  {
    icon: BarChart3,
    title: "تتبع الأداء",
    description: "راقب عدد مرات مسح كل رمز QR والإحصائيات المفصلة للاستخدام",
  },
  {
    icon: Shield,
    title: "آمن وموثوق",
    description: "حماية بيانات عالية وتخزين آمن لجميع رموز QR الخاصة بك",
  },
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">إنشاء رموز QR احترافية بسهولة</h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            قم بتحويل محتواك إلى رموز QR قابلة للمسح فوراً. مشاركة بطاقات العمل، الروابط، الملفات، والمزيد بطريقة حديثة وفعالة.
          </p>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white gap-2 text-lg px-8"
            onClick={() => {
              const element = document.getElementById('qr-types');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <QrCode className="w-5 h-5" />
            ابدأ الآن
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h1>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setLocation("/history")}
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none text-sm sm:text-base"
                >
                  <History className="w-4 h-4" />
                  السجل
                </Button>
                <Button
                  onClick={() => setLocation("/scanner")}
                  className="bg-green-600 hover:bg-green-700 gap-2 flex-1 sm:flex-none text-sm sm:text-base"
                >
                  <Scan className="w-4 h-4" />
                  ماسح QR
                </Button>
              </div>
            </div>
            <p className="text-gray-600 text-sm md:text-base">اختر نوع رمز QR الذي تريد إنشاءه</p>
          </div>

          {/* QR Type Selection Grid */}
          <div id="qr-types" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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

          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">لماذا تختار تطبيقنا؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-blue-100 rounded-lg mb-4">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Usage Guide Section */}
          <div className="mb-12 bg-blue-50 rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">كيفية الاستخدام</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">اختر نوع QR</h3>
                  <p className="text-gray-600">
                    حدد نوع المحتوى الذي تريد تحويله إلى رمز QR من الخيارات المتاحة أعلاه
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">أدخل البيانات</h3>
                  <p className="text-gray-600">
                    ملء النموذج بالمعلومات المطلوبة مثل الروابط أو بيانات الاتصال أو الملفات
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">حمّل واستخدم</h3>
                  <p className="text-gray-600">
                    حمّل رمز QR وشاركه مع الآخرين أو استخدمه في مشاريعك بسهولة
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
