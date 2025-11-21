import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Scan,
  History,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_TITLE, APP_LOGO } from "@/const";

const QR_TYPES = [
  { id: "vcard", label: "vCard", icon: User, description: "بطاقة العمل" },
  { id: "url", label: "الروابط", icon: LinkIcon, description: "روابط متعددة" },
  { id: "pdf", label: "PDF", icon: FileText, description: "ملف PDF" },
  { id: "image", label: "الصور", icon: ImageIcon, description: "صور متعددة" },
  { id: "video", label: "الفيديو", icon: Video, description: "فيديو" },
  { id: "business", label: "الأعمال", icon: Briefcase, description: "معلومات الأعمال" },
  { id: "mp3", label: "MP3", icon: Music, description: "ملف صوتي" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, description: "رسائل واتساب" },
  { id: "wifi", label: "الواي فاي", icon: Wifi, description: "شبكة واي فاي" },
  { id: "coupon", label: "قسيمة", icon: Ticket, description: "قسيمة شراء" },
  { id: "app", label: "التطبيقات", icon: Package, description: "متجر التطبيقات" },
  { id: "menu", label: "القائمة", icon: UtensilsCrossed, description: "قائمة مطعم" },
];

export default function Navigation() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />}
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">{APP_TITLE}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* Create QR Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <QrCode className="w-4 h-4" />
                  إنشاء QR
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {QR_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setLocation(`/generator/${type.id}`);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-right"
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-gray-900">{type.label}</span>
                          <span className="text-xs text-gray-500">{type.description}</span>
                        </div>
                        <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  الأدوات
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation("/scanner")} className="gap-2 cursor-pointer">
                  <Scan className="w-4 h-4" />
                  ماسح QR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/history")} className="gap-2 cursor-pointer">
                  <History className="w-4 h-4" />
                  سجل المسحات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="w-4 h-4" />
                  {user?.name || "حسابي"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-gray-500">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setLocation("/my-qrcodes")} 
                  className="gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  رموزي
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setLocation("/scanner");
                setMobileMenuOpen(false);
              }}
            >
              <Scan className="w-4 h-4" />
              ماسح QR
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setLocation("/history");
                setMobileMenuOpen(false);
              }}
            >
              <History className="w-4 h-4" />
              سجل المسحات
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setLocation("/my-qrcodes");
                setMobileMenuOpen(false);
              }}
            >
              <QrCode className="w-4 h-4" />
              رموزي
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
