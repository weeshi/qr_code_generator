import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  User,
  LogOut,
  Loader2,
  FileText,
  Download,
  Trash2,
  Gift,
  TrendingUp,
  Star,
  Clock,
  Award,
  Zap,
  Settings,
  Mail,
  Calendar,
  HardDrive,
} from "lucide-react";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "files" | "loyalty" | "rewards" | "settings">("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">يجب تسجيل الدخول أولاً</p>
          <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name || "مستخدم"}</h1>
                <p className="text-blue-100">{user.email}</p>
                <p className="text-blue-100 text-sm mt-1">عضو منذ {new Date(user.createdAt).toLocaleDateString("ar-SA")}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="gap-2 bg-white text-blue-600 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">نقاط الولاء</p>
                  <p className="text-3xl font-bold text-blue-600">2,450</p>
                </div>
                <Star className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المستوى</p>
                  <p className="text-3xl font-bold text-purple-600">ذهبي</p>
                </div>
                <Award className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الملفات</p>
                  <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <FileText className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المساحة المستخدمة</p>
                  <p className="text-3xl font-bold text-orange-600">2.4 GB</p>
                </div>
                <HardDrive className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "نظرة عامة", icon: User },
            { id: "files", label: "الملفات", icon: FileText },
            { id: "loyalty", label: "نقاط الولاء", icon: Star },
            { id: "rewards", label: "المكافآت", icon: Gift },
            { id: "settings", label: "الإعدادات", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحساب</CardTitle>
                <CardDescription>بيانات حسابك الشخصية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">الاسم</label>
                      <p className="text-gray-900 mt-1">{user.name || "غير محدد"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                      <p className="text-gray-900 mt-1">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">تاريخ الانضمام</label>
                      <p className="text-gray-900 mt-1">{new Date(user.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">آخر تسجيل دخول</label>
                      <p className="text-gray-900 mt-1">{new Date(user.lastSignedIn).toLocaleDateString("ar-SA")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  إحصائيات النشاط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">156</div>
                    <div className="text-sm text-gray-600">رموز QR تم إنشاؤها</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">3,240</div>
                    <div className="text-sm text-gray-600">عمليات مسح</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">24</div>
                    <div className="text-sm text-gray-600">ملفات مرفوعة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    ملفاتي
                  </span>
                  <Button className="bg-green-600 hover:bg-green-700 gap-2">
                    <Download className="w-4 h-4" />
                    رفع ملف جديد
                  </Button>
                </CardTitle>
                <CardDescription>إدارة الملفات والمشاريع الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "شعار الشركة.png", size: "2.4 MB", date: "2026-02-12", type: "image" },
                    { name: "كتالوج المنتجات.pdf", size: "5.8 MB", date: "2026-02-11", type: "pdf" },
                    { name: "فيديو العرض.mp4", size: "125 MB", date: "2026-02-10", type: "video" },
                    { name: "بطاقة العمل.png", size: "1.2 MB", date: "2026-02-09", type: "image" },
                  ].map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.size} • {file.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === "loyalty" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  نقاط الولاء
                </CardTitle>
                <CardDescription>تتبع نقاطك والمكافآت المتاحة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Points Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">النقاط المتاحة</span>
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">2,450</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">إجمالي النقاط</span>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">5,890</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">النقاط المستخدمة</span>
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-600">3,440</div>
                    </div>
                  </div>

                  {/* Tier Progress */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-900">مستوى العضوية: ذهبي</span>
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>التقدم نحو البلاتينيوم</span>
                        <span>4,110 / 10,000 نقطة</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full" style={{ width: "41%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">آخر العمليات</h3>
                    <div className="space-y-3">
                      {[
                        { action: "إنشاء رمز QR", points: "+50", date: "منذ ساعة", type: "earned" },
                        { action: "مسح رمز QR", points: "+25", date: "منذ 3 ساعات", type: "earned" },
                        { action: "استرجاع مكافأة", points: "-200", date: "منذ يومين", type: "redeemed" },
                        { action: "مكافأة إحالة", points: "+100", date: "منذ 5 أيام", type: "earned" },
                      ].map((trans, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${trans.type === "earned" ? "bg-green-100" : "bg-orange-100"}`}>
                              {trans.type === "earned" ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <Zap className="w-4 h-4 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{trans.action}</div>
                              <div className="text-xs text-gray-500">{trans.date}</div>
                            </div>
                          </div>
                          <div className={`font-bold ${trans.type === "earned" ? "text-green-600" : "text-orange-600"}`}>
                            {trans.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  المكافآت المتاحة
                </CardTitle>
                <CardDescription>استرجع المكافآت باستخدام نقاطك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "خصم 10%", points: 500, icon: "🎉" },
                    { name: "ميزة متقدمة", points: 1000, icon: "⭐" },
                    { name: "وصول VIP", points: 2000, icon: "👑" },
                    { name: "شهر مجاني", points: 3000, icon: "🎁" },
                  ].map((reward, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-2xl mb-2">{reward.icon}</div>
                          <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-600">{reward.points}</div>
                          <div className="text-xs text-gray-500">نقطة</div>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={reward.points > 2450}
                      >
                        استرجاع الآن
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
                <CardDescription>إدارة تفضيلات حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">الإشعارات البريدية</div>
                      <div className="text-sm text-gray-600">استقبل تحديثات حول نقاطك والمكافآت</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">الإشعارات الفورية</div>
                      <div className="text-sm text-gray-600">تنبيهات فورية عند اكتساب نقاط</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">الخصوصية</div>
                      <div className="text-sm text-gray-600">إظهار ملفي الشخصي للآخرين</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
