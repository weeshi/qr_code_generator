import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";

export default function Administrator() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"users" | "permissions" | "backups" | "activity" | "settings">("users");

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

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">آخر المستخدمين المسجلين</h3>
                    <div className="space-y-3">
                      {[
                        { name: "أحمد محمد", email: "ahmed@example.com", role: "user", joinDate: "منذ ساعة" },
                        { name: "فاطمة علي", email: "fatima@example.com", role: "user", joinDate: "منذ يومين" },
                        { name: "محمود حسن", email: "mahmoud@example.com", role: "admin", joinDate: "منذ أسبوع" },
                      ].map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {user.role === "admin" ? "مسؤول" : "مستخدم"}
                            </span>
                            <span className="text-xs text-gray-500">{user.joinDate}</span>
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

        {/* Permissions Management */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  إدارة الصلاحيات
                </CardTitle>
                <CardDescription>منح وإدارة صلاحيات المستخدمين</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">245</div>
                      <div className="text-sm text-gray-600">صلاحيات نشطة</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600 mb-1">32</div>
                      <div className="text-sm text-gray-600">صلاحيات منتهية الصلاحية</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">أنواع الصلاحيات</h3>
                    <div className="space-y-3">
                      {[
                        { type: "create_qr", label: "إنشاء رموز QR", count: 89 },
                        { type: "scan", label: "مسح رموز QR", count: 156 },
                        { type: "export", label: "تصدير البيانات", count: 45 },
                        { type: "share", label: "مشاركة الرموز", count: 67 },
                        { type: "analytics", label: "عرض التحليلات", count: 78 },
                      ].map((perm) => (
                        <div key={perm.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-900">{perm.label}</div>
                            <div className="text-xs text-gray-500">{perm.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              {perm.count} نشطة
                            </span>
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

        {/* Backups Management */}
        {activeTab === "backups" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileArchive className="w-5 h-5" />
                  إدارة النسخ الاحتياطية
                </CardTitle>
                <CardDescription>إنشاء وإدارة النسخ الاحتياطية للبيانات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2 mb-6">
                    <Button className="bg-green-600 hover:bg-green-700 gap-2">
                      <Download className="w-4 h-4" />
                      إنشاء نسخة احتياطية كاملة
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Clock className="w-4 h-4" />
                      جدولة نسخة احتياطية
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600 mb-1">45</div>
                      <div className="text-sm text-gray-600">إجمالي النسخ</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-600 mb-1">38</div>
                      <div className="text-sm text-gray-600">نسخ مكتملة</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600 mb-1">7</div>
                      <div className="text-sm text-gray-600">قيد المعالجة</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">آخر النسخ الاحتياطية</h3>
                    <div className="space-y-3">
                      {[
                        { date: "2026-02-12", type: "full", status: "completed", size: "2.4 GB" },
                        { date: "2026-02-11", type: "incremental", status: "completed", size: "156 MB" },
                        { date: "2026-02-10", type: "full", status: "completed", size: "2.3 GB" },
                      ].map((backup, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FileArchive className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{backup.date}</div>
                              <div className="text-xs text-gray-500">{backup.type === "full" ? "نسخة كاملة" : "نسخة إضافية"} - {backup.size}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Download className="w-4 h-4" />
                              تحميل
                            </Button>
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

        {/* Activity Logs */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  سجل النشاط
                </CardTitle>
                <CardDescription>تتبع جميع إجراءات المسؤولين والنشاط على النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "تم منح صلاحية", user: "أحمد محمد", time: "منذ 5 دقائق", type: "grant" },
                    { action: "تم حذف مستخدم", user: "فاطمة علي", time: "منذ ساعة", type: "delete" },
                    { action: "تم إنشاء نسخة احتياطية", user: "النظام", time: "منذ ساعتين", type: "backup" },
                    { action: "تم تحديث الصلاحيات", user: "محمود حسن", time: "منذ 3 ساعات", type: "update" },
                    { action: "تم تسجيل دخول مسؤول", user: "علي محمد", time: "منذ 5 ساعات", type: "login" },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.type === "grant" ? "bg-green-100" :
                          log.type === "delete" ? "bg-red-100" :
                          log.type === "backup" ? "bg-blue-100" :
                          log.type === "update" ? "bg-yellow-100" :
                          "bg-purple-100"
                        }`}>
                          {log.type === "grant" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          {log.type === "delete" && <AlertCircle className="w-4 h-4 text-red-600" />}
                          {log.type === "backup" && <FileArchive className="w-4 h-4 text-blue-600" />}
                          {log.type === "update" && <Settings className="w-4 h-4 text-yellow-600" />}
                          {log.type === "login" && <Lock className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{log.action}</div>
                          <div className="text-xs text-gray-500">بواسطة: {log.user}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{log.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات النظام
                </CardTitle>
                <CardDescription>إدارة إعدادات النظام والتكوينات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-2">إجمالي مساحة التخزين</div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">500 GB</div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2">325 GB مستخدمة (65%)</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-2">معدل النشاط</div>
                      <div className="text-2xl font-bold text-green-600 mb-2">2,456</div>
                      <div className="text-xs text-gray-600">عملية في الدقيقة</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">خيارات النظام</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">تفعيل الصيانة</div>
                          <div className="text-xs text-gray-600">إيقاف النظام للصيانة</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">تفعيل التسجيل المتقدم</div>
                          <div className="text-xs text-gray-600">تسجيل تفصيلي لجميع العمليات</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">السماح بالتسجيل الجديد</div>
                          <div className="text-xs text-gray-600">السماح للمستخدمين الجدد بالتسجيل</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" defaultChecked />
                      </div>
                    </div>
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
