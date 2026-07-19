import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";

interface PointsRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export function PointsRateModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: PointsRateModalProps) {
  const [formData, setFormData] = useState(
    initialData || {
      action: "",
      type: "",
      points: 0,
      active: true,
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.action || !formData.type || formData.points <= 0) {
      toast.error("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      toast.success(
        isEditing
          ? "تم تحديث معدل النقاط بنجاح"
          : "تم إضافة معدل النقاط بنجاح"
      );
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle>
            {isEditing ? "تعديل معدل النقاط" : "إضافة معدل نقاط جديد"}
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الإجراء
            </label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
              placeholder="مثال: إنشاء QR"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الإجراء
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">اختر نوعاً...</option>
              <option value="qr_creation">إنشاء QR</option>
              <option value="qr_scan">مسح QR</option>
              <option value="referral">إحالة صديق</option>
              <option value="daily_login">تسجيل دخول يومي</option>
              <option value="file_upload">تحميل ملف</option>
              <option value="social_share">مشاركة اجتماعية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد النقاط
            </label>
            <input
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  points: parseInt(e.target.value) || 0,
                })
              }
              placeholder="أدخل عدد النقاط"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              تفعيل هذا المعدل
            </label>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 سيحصل المستخدمون على {formData.points || 0} نقطة عند{" "}
              {formData.action || "تنفيذ الإجراء"}
            </p>
          </div>
        </CardContent>

        <div className="flex gap-2 p-6 border-t bg-gray-50">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "جاري الحفظ..." : "حفظ"}
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
