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
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Globe,
  Smartphone,
  Store,
  Utensils,
  Building2,
  Award,
  Star,
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

const USE_CASES = [
  {
    icon: Store,
    title: "المتاجر الإلكترونية",
    description: "ربط المنتجات بصفحات المتجر عبر رموز QR فريدة لكل منتج",
    examples: ["عرض تفاصيل المنتج", "تطبيق الخصومات", "تتبع المبيعات"],
  },
  {
    icon: Utensils,
    title: "المطاعم والكافيهات",
    description: "عرض القوائم الرقمية وتسهيل الطلبات عبر رموز QR",
    examples: ["قوائم تفاعلية", "طلب سريع", "تقييم الخدمة"],
  },
  {
    icon: Building2,
    title: "الشركات والمؤسسات",
    description: "مشاركة بيانات الاتصال والعروض التقديمية بسهولة",
    examples: ["بطاقات عمل رقمية", "عروض تقديمية", "معلومات الشركة"],
  },
  {
    icon: Smartphone,
    title: "التسويق الرقمي",
    description: "زيادة التفاعل مع الجمهور عبر حملات QR مستهدفة",
    examples: ["حملات إعلانية", "مسابقات وجوائز", "روابط اجتماعية"],
  },
  {
    icon: Globe,
    title: "الفعاليات والمؤتمرات",
    description: "تسهيل التسجيل والدخول عبر رموز QR",
    examples: ["تذاكر رقمية", "تسجيل الحضور", "معلومات الفعالية"],
  },
  {
    icon: Award,
    title: "البرامج الولائية",
    description: "إدارة برامج الولاء والمكافآت بكفاءة",
    examples: ["نقاط الولاء", "عروض حصرية", "تتبع المشتريات"],
  },
];

const ADVANCED_FEATURES = [
  {
    icon: TrendingUp,
    title: "تحليلات متقدمة",
    description: "احصل على رؤى عميقة عن أداء رموز QR الخاصة بك مع تقارير مفصلة",
  },
  {
    icon: Users,
    title: "إدارة الفريق",
    description: "تعاون مع فريقك وأدر الأذونات والصلاحيات بسهولة",
  },
  {
    icon: Shield,
    title: "أمان عالي",
    description: "تشفير من الدرجة الأولى وحماية كاملة لبيانات المستخدمين",
  },
  {
    icon: CheckCircle2,
    title: "دعم شامل",
    description: "فريق دعم متاح 24/7 للإجابة على جميع استفساراتك",
  },
];

const TESTIMONIALS = [
  {
    name: "أحمد محمد",
    role: "صاحب متجر إلكتروني",
    content: "زادت المبيعات بنسبة 35% بعد استخدام رموز QR من المنصة",
    rating: 5,
  },
  {
    name: "فاطمة علي",
    role: "مدير تسويق",
    content: "أداة رائعة وسهلة الاستخدام، وفرت لنا الكثير من الوقت والجهد",
    rating: 5,
  },
  {
    name: "محمود حسن",
    role: "مالك مطعم",
    content: "العملاء يحبون القوائم الرقمية، وتقليل الأوراق بنسبة 100%",
    rating: 5,
  },
];

const STATS = [
  { label: "مستخدم نشط", value: "50,000+" },
  { label: "رمز QR تم إنشاؤه", value: "1,000,000+" },
  { label: "عمليات مسح يومية", value: "5,000,000+" },
  { label: "دول مدعومة", value: "150+" },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-6 flex justify-center">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="w-20 h-20" />}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{APP_TITLE}</h1>
          <p className="text-xl text-gray-300 mb-8">
            منصة احترافية لإنشاء رموز QR متقدمة مع تحليلات شاملة وميزات قوية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white text-lg px-8"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              ابدأ الآن
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10 text-lg px-8"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              تعرف على المزيد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Enhanced */}
      <div
        className="relative h-96 md:h-[550px] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 rounded-full border border-green-400/30">
            <span className="text-sm font-semibold text-green-200">✨ منصة رموز QR الاحترافية</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            حول محتواك إلى رموز QR احترافية
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 leading-relaxed">
            منصة متكاملة لإنشاء وإدارة رموز QR مع تحليلات متقدمة وميزات قوية تناسب جميع احتياجاتك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white gap-2 text-lg px-8 shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                const element = document.getElementById('qr-types');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <QrCode className="w-5 h-5" />
              ابدأ الإنشاء الآن
            </Button>
            <Button
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white gap-2 text-lg px-8 border border-white/30 backdrop-blur-sm"
              onClick={() => setLocation("/scanner")}
            >
              <Scan className="w-5 h-5" />
              ماسح QR
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Statistics Section */}
          <div className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {STATS.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">اختر نوع رمز QR</h2>
                <p className="text-gray-600">12 نوع مختلف لجميع احتياجاتك</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setLocation("/history")}
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <History className="w-4 h-4" />
                  السجل
                </Button>
                <Button
                  onClick={() => setLocation("/scanner")}
                  className="bg-green-600 hover:bg-green-700 gap-2 flex-1 sm:flex-none"
                >
                  <Scan className="w-4 h-4" />
                  ماسح QR
                </Button>
              </div>
            </div>
          </div>

          {/* QR Type Selection Grid */}
          <div id="qr-types" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {QR_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedType === type.id ? "ring-2 ring-green-500 bg-green-50" : "hover:border-green-300"
                  }`}
                  onClick={() => {
                    setSelectedType(type.id);
                    setLocation(`/generator/${type.id}`);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
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

          {/* Use Cases Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">حالات الاستخدام الواقعية</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                استخدم رموز QR في مختلف المجالات لزيادة التفاعل والكفاءة
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {USE_CASES.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle className="text-xl">{useCase.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">{useCase.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {useCase.examples.map((example, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {example}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Advanced Features Section */}
          <div className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ميزات متقدمة</h2>
              <p className="text-lg text-gray-600">كل ما تحتاجه لإدارة رموز QR بكفاءة واحترافية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ADVANCED_FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">آراء المستخدمين</h2>
              <p className="text-lg text-gray-600">ماذا يقول مستخدمونا عن المنصة</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز لبدء الإنشاء؟</h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف المستخدمين الذين يستخدمون منصتنا لإنشاء رموز QR احترافية
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 gap-2 text-lg px-8"
              onClick={() => {
                const element = document.getElementById('qr-types');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <QrCode className="w-5 h-5" />
              ابدأ الآن مجاناً
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
