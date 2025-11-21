import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Users,
  BarChart3,
  Shield,
  Loader2,
  Search,
  Edit2,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<"user" | "admin" | null>(null);

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">وصول مرفوض</p>
            <p className="text-gray-600 mb-4">أنت لا تملك صلاحيات الوصول إلى لوحة التحكم</p>
            <Button onClick={() => setLocation("/")} className="w-full">
              العودة إلى الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users, isLoading: usersLoading } = trpc.admin.getAllUsers.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: stats, isLoading: statsLoading } = trpc.admin.getSystemStats.useQuery();
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation();

  const handleRoleUpdate = async (userId: number, newRole: "user" | "admin") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      setEditingUserId(null);
      setEditingRole(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const filteredUsers = users?.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (usersLoading || statsLoading) {
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
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المسؤول</h1>
          </div>
          <p className="text-gray-600">إدارة المستخدمين والنظام</p>
        </div>

        {/* Statistics Cards */}
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-blue-600">{(stats as any).totalUsers}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">المسؤولون</p>
                  <p className="text-3xl font-bold text-green-600">{(stats as any).adminCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">رموز QR</p>
                  <p className="text-3xl font-bold text-purple-600">{(stats as any).totalQRCodes}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-2">إجمالي المسحات</p>
                  <p className="text-3xl font-bold text-orange-600">{(stats as any).totalScans}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              إدارة المستخدمين
            </CardTitle>
            <CardDescription>البحث وإدارة صلاحيات المستخدمين</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الدور</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">تاريخ الانضمام</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{u.name || "غير محدد"}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{u.email}</td>
                      <td className="py-3 px-4">
                        {editingUserId === u.id ? (
                          <select
                            value={editingRole || u.role}
                            onChange={(e) => setEditingRole(e.target.value as "user" | "admin")}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="user">مستخدم</option>
                            <option value="admin">مسؤول</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === "admin"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {u.role === "admin" ? "مسؤول" : "مستخدم"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(u.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-3 px-4">
                        {editingUserId === u.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleRoleUpdate(u.id, editingRole || u.role)}
                              disabled={updateRoleMutation.isPending}
                            >
                              <Check className="w-4 h-4" />
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setEditingUserId(null);
                                setEditingRole(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditingRole(u.role);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                            تعديل
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!filteredUsers || filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لم يتم العثور على مستخدمين</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
