import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{APP_TITLE}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              تطبيق احترافي لإنشاء ومسح رموز QR بسهولة. شارك محتواك مع العالم بطريقة حديثة وفعالة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="/scanner" className="hover:text-white transition-colors">
                  ماسح QR
                </a>
              </li>
              <li>
                <a href="/history" className="hover:text-white transition-colors">
                  السجل
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">الدعم</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  شروط الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  اتصل بنا
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                <a href="mailto:info@example.com" className="hover:text-white transition-colors">
                  info@example.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                <a href="tel:+966123456789" className="hover:text-white transition-colors">
                  +966 12 345 6789
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                <span>الرياض، المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Copyright */}
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            <p>© {currentYear} {APP_TITLE}. جميع الحقوق محفوظة.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
