import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Shield, CreditCard, Zap } from "lucide-react";
import { toast } from "sonner";

interface AdvancedUserEditModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

export function AdvancedUserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
}: AdvancedUserEditModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "permissions" | "subscription" | "points">("basic");
  const [formData, setFormData] = useState(user || {});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
      toast.success("تم حفظ بيانات المستخدم بنجاح");
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl">تعديل المستخدم: {user?.name}</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "basic"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="w-4 h-4" />
            معلومات أساسية
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "permissions"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="w-4 h-4" />
            الصلاحيات
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "subscription"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            الاشتراك
          </button>
          <button
            onClick={() => setActiveTab("points")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "points"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            النقاط
          </button>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
                <select
                  value={formData.role || "user"}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={formData.status || "active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="banned">محظور</option>
                </select>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">الصلاحيات المتاحة</h4>
                <div className="space-y-2">
                  {["create_qr", "scan_qr", "export", "manage_files", "view_analytics"].map((perm) => (
                    <label key={perm} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مدة الصلاحيات (بالأشهر)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="1">شهر واحد</option>
                  <option value="3">3 أشهر</option>
                  <option value="6">6 أشهر</option>
                  <option value="12">سنة واحدة</option>
                </select>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">خطة الاشتراك</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="free">مجاني</option>
                  <option value="professional">احترافي</option>
                  <option value="enterprise">مؤسسي</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البدء</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الدفع</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="active">نشط</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="expired">منتهي الصلاحية</option>
                </select>
              </div>
            </div>
          )}

          {/* Points Tab */}
          {activeTab === "points" && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">النقاط الحالية</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {formData.loyaltyPoints || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تعديل النقاط</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="أدخل عدد النقاط"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <Button className="bg-green-600 hover:bg-green-700">إضافة</Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب التعديل</label>
                <textarea
                  placeholder="أدخل سبب التعديل..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مستوى العضوية</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="bronze">برونزي</option>
                  <option value="silver">فضي</option>
                  <option value="gold">ذهبي</option>
                  <option value="platinum">بلاتينيوم</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t bg-gray-50">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSaving}
          >
            إلغاء
          </Button>
        </div>
      </Card>
    </div>
  );
}
