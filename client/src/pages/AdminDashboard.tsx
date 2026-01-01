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
  Lock,
  Clock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<"user" | "admin" | null>(null);
  const [selectedUserForPermission, setSelectedUserForPermission] = useState<number | null>(null);
  const [permissionType, setPermissionType] = useState<string>("create_qr");
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [permissionReason, setPermissionReason] = useState<string>("");

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
  const grantPermissionMutation = trpc.permissions.grantPermission.useMutation();
  const revokePermissionMutation = trpc.permissions.revokePermission.useMutation();
  const { data: userPermissions, refetch: refetchPermissions } = trpc.permissions.getUserPermissions.useQuery(
    { userId: selectedUserForPermission || 0 },
    { enabled: selectedUserForPermission !== null }
  );

  const handleRoleUpdate = async (userId: number, newRole: "user" | "admin") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      setEditingUserId(null);
      setEditingRole(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedUserForPermission) return;
    try {
      await grantPermissionMutation.mutateAsync({
        userId: selectedUserForPermission,
        permissionType: permissionType as any,
        durationMonths,
        reason: permissionReason || undefined,
      });
      setPermissionType("create_qr");
      setDurationMonths(1);
      setPermissionReason("");
      await refetchPermissions();
      toast.success("تم منح الصلاحية بنجاح");
    } catch (error) {
      toast.error("فشل منح الصلاحية");
    }
  };

  const handleRevokePermission = async (permissionId: number) => {
    try {
      await revokePermissionMutation.mutateAsync({ permissionId });
      await refetchPermissions();
      toast.success("تم إلغاء الصلاحية بنجاح");
    } catch (error) {
      toast.error("فشل إلغاء الصلاحية");
    }
  };

  const filteredUsers = users?.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المسؤول</h1>
          <p className="text-gray-600 mt-2">إدارة المستخدمين والصلاحيات والإحصائيات</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{(stats as any)?.totalUsers || 0}</p>
                  <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{(stats as any)?.totalQRCodes || 0}</p>
                  <p className="text-sm text-gray-600">إجمالي رموز QR</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{(stats as any)?.adminCount || 0}</p>
                  <p className="text-sm text-gray-600">المسؤولون</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Search className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{(stats as any)?.totalScans || 0}</p>
                  <p className="text-sm text-gray-600">إجمالي المسحات</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              إدارة المستخدمين
            </CardTitle>
            <CardDescription>عرض وتعديل صلاحيات المستخدمين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="ابحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الاسم</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">الدور</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{u.name || "بدون اسم"}</td>
                        <td className="py-3 px-4">{u.email || "بدون بريد"}</td>
                        <td className="py-3 px-4">
                          {editingUserId === u.id ? (
                            <div className="flex gap-2">
                              <select
                                value={editingRole || "user"}
                                onChange={(e) => setEditingRole(e.target.value as any)}
                                className="border rounded px-2 py-1"
                              >
                                <option value="user">مستخدم</option>
                                <option value="admin">مسؤول</option>
                              </select>
                              <Button
                                size="sm"
                                onClick={() => handleRoleUpdate(u.id, editingRole!)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingUserId(null);
                                  setEditingRole(null);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {u.role === "admin" ? "مسؤول" : "مستخدم"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(u.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">
                          {editingUserId !== u.id && (
                            <Button
                              size="sm"
                              variant="outline"
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
            )}

            {!filteredUsers || filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لم يتم العثور على مستخدمين</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Permission Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              إدارة الصلاحيات
            </CardTitle>
            <CardDescription>منح وإدارة صلاحيات المستخدمين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">اختر مستخدماً</label>
                <select
                  value={selectedUserForPermission || ""}
                  onChange={(e) => setSelectedUserForPermission(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">-- اختر مستخدماً --</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserForPermission && (
                <>
                  {/* Permission Grant Form */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      منح صلاحية جديدة
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">نوع الصلاحية</label>
                        <select
                          value={permissionType}
                          onChange={(e) => setPermissionType(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="create_qr">إنشاء رموز QR</option>
                          <option value="scan">المسح الضوئي</option>
                          <option value="export">التصدير</option>
                          <option value="share">المشاركة</option>
                          <option value="analytics">التحليلات</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">المدة (بالأشهر)</label>
                        <select
                          value={durationMonths}
                          onChange={(e) => setDurationMonths(parseInt(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          {[1, 2, 3, 6, 12].map((m) => (
                            <option key={m} value={m}>
                              {m} {m === 1 ? "شهر" : "أشهر"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">السبب (اختياري)</label>
                        <Input
                          value={permissionReason}
                          onChange={(e) => setPermissionReason(e.target.value)}
                          placeholder="أدخل سبب منح الصلاحية"
                        />
                      </div>

                      <Button
                        onClick={handleGrantPermission}
                        disabled={grantPermissionMutation.isPending}
                        className="w-full"
                      >
                        {grantPermissionMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            جاري المعالجة...
                          </>
                        ) : (
                          "منح الصلاحية"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Existing Permissions */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">الصلاحيات الحالية</h3>
                    {userPermissions && userPermissions.length > 0 ? (
                      <div className="space-y-2">
                        {userPermissions.map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{perm.permissionType}</p>
                              <p className="text-sm text-gray-600">
                                ينتهي في: {new Date(perm.expiresAt).toLocaleDateString("ar-SA")}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleRevokePermission(perm.id)}
                              variant="destructive"
                              size="sm"
                              disabled={revokePermissionMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا توجد صلاحيات حالية</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
