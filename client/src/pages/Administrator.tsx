import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Users,
  Shield,
  HardDrive,
  Activity,
  Lock,
  LogOut,
  Loader2,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Clock,
  FileArchive,
  BarChart3,
  Settings,
  Star,
  TrendingUp,
  Gift,
  Zap,
} from "lucide-react";

export default function Administrator() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "loyalty" | "backups" | "activity" | "settings">("users");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <Lock className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-8 text-lg">
            You do not have permission to access this page. Only administrators can view this section.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setLocation("/")}
          >
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administrator Panel</h1>
              <p className="text-sm text-gray-600">System Management & Configuration</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation("/")}
          >
            <LogOut className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "users", label: "المستخدمون", icon: Users },
            { id: "permissions", label: "الصلاحيات", icon: Shield },
            { id: "loyalty", label: "إدارة النقاط", icon: BarChart3 },
            { id: "backups", label: "النسخ الاحتياطية", icon: FileArchive },
            { id: "activity", label: "سجل النشاط", icon: Activity },
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

        {/* Loyalty Points Management Tab */}
        {activeTab === "loyalty" && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">إجمالي النقاط الموزعة</p>
                      <p className="text-3xl font-bold text-yellow-600">5,234,890</p>
                    </div>
                    <Star className="w-10 h-10 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">النقاط المستردة</p>
                      <p className="text-3xl font-bold text-orange-600">1,245,670</p>
                    </div>
                    <Zap className="w-10 h-10 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">المستخدمون النشطون</p>
                      <p className="text-3xl font-bold text-green-600">856</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">متوسط النقاط للمستخدم</p>
                      <p className="text-3xl font-bold text-blue-600">6,120</p>
                    </div>
                    <BarChart3 className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Points Rates Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إدارة معدلات النقاط
                </CardTitle>
                <CardDescription>تحديد عدد النقاط لكل عملية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "إنشاء رمز QR", type: "qr_created", points: 50, active: true },
                    { action: "مسح رمز QR", type: "qr_scanned", points: 25, active: true },
                    { action: "تحميل ملف", type: "file_uploaded", points: 30, active: true },
                    { action: "إحالة صديق", type: "referral", points: 100, active: true },
                    { action: "مكافأة التسجيل", type: "signup_bonus", points: 200, active: true },
                    { action: "تسجيل دخول يومي", type: "daily_login", points: 10, active: false },
                  ].map((rate) => (
                    <div key={rate.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{rate.action}</div>
                        <div className="text-xs text-gray-500">{rate.type}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-600">{rate.points}</div>
                          <div className="text-xs text-gray-500">نقطة</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={rate.points}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            تحديث
                          </Button>
                          <Button
                            size="sm"
                            variant={rate.active ? "default" : "outline"}
                            className={rate.active ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {rate.active ? "مفعل" : "معطل"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Users with Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  أعلى المستخدمين بالنقاط
                </CardTitle>
                <CardDescription>المستخدمون الذين يملكون أكثر النقاط</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "أحمد محمد", points: 15240, tier: "platinum", email: "ahmed@example.com" },
                    { rank: 2, name: "فاطمة علي", points: 12890, tier: "gold", email: "fatima@example.com" },
                    { rank: 3, name: "محمود حسن", points: 10450, tier: "gold", email: "mahmoud@example.com" },
                    { rank: 4, name: "سارة إبراهيم", points: 8760, tier: "silver", email: "sarah@example.com" },
                    { rank: 5, name: "علي أحمد", points: 7320, tier: "silver", email: "ali@example.com" },
                  ].map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {user.rank}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600">{user.points}</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${
                            user.tier === "platinum" ? "bg-purple-100 text-purple-700" :
                            user.tier === "gold" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {user.tier === "platinum" ? "بلاتينيوم" : user.tier === "gold" ? "ذهبي" : "فضي"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Manual Points Adjustment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  تعديل النقاط يدويًا
                </CardTitle>
                <CardDescription>إضافة أو خصم نقاط من حسابات المستخدمين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">اختر المستخدم</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option>اختر مستخدماً...</option>
                        <option>أحمد محمد</option>
                        <option>فاطمة علي</option>
                        <option>محمود حسن</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد النقاط</label>
                      <input
                        type="number"
                        placeholder="أدخل عدد النقاط"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                    <textarea
                      placeholder="أدخل سبب التعديل..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                    ></textarea>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">تطبيق التعديل</Button>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  إدارة المكافآت
                </CardTitle>
                <CardDescription>إضافة وتعديل المكافآت المتاحة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "خصم 10%", points: 500, type: "discount", redemptions: 45 },
                    { name: "ميزة متقدمة", points: 1000, type: "feature_unlock", redemptions: 23 },
                    { name: "وصول VIP", points: 2000, type: "premium_access", redemptions: 12 },
                    { name: "شهر مجاني", points: 3000, type: "premium_access", redemptions: 8 },
                  ].map((reward) => (
                    <div key={reward.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{reward.name}</div>
                        <div className="text-xs text-gray-500">{reward.type}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600">{reward.points}</div>
                          <div className="text-xs text-gray-500">{reward.redemptions} استرجاع</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">تعديل</Button>
                          <Button size="sm" variant="outline" className="text-red-600">حذف</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 gap-2">
                  <Gift className="w-4 h-4" />
                  إضافة مكافأة جديدة
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المستخدمين
                </CardTitle>
                <CardDescription>عرض وإدارة جميع المستخدمين في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">1,234</div>
                      <div className="text-sm text-gray-600">إجمالي المستخدمين</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">856</div>
                      <div className="text-sm text-gray-600">مستخدمون نشطون</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">12</div>
                      <div className="text-sm text-gray-600">مسؤولون</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other tabs placeholder */}
        {(activeTab === "permissions" || activeTab === "backups" || activeTab === "activity" || activeTab === "settings") && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">محتوى التبويب قيد التطوير...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
