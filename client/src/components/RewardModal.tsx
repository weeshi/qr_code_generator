import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export function RewardModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: RewardModalProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      points: 0,
      type: "discount",
      value: "",
      maxRedemptions: null,
      active: true,
    }
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.name || formData.points <= 0 || !formData.value) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      toast.success(
        isEditing ? "تم تحديث المكافأة بنجاح" : "تم إضافة المكافأة بنجاح"
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
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle>
            {isEditing ? "تعديل المكافأة" : "إضافة مكافأة جديدة"}
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
              اسم المكافأة
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="مثال: خصم 10%"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="وصف المكافأة..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد النقاط المطلوبة
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المكافأة
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="discount">خصم</option>
                <option value="feature_unlock">فتح ميزة</option>
                <option value="premium_access">وصول VIP</option>
                <option value="coupon">كوبون</option>
                <option value="badge">شارة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              قيمة المكافأة
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              placeholder="مثال: 10% أو رمز: SAVE10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحد الأقصى للاسترجاع (اتركه فارغاً للحد غير محدود)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxRedemptions || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxRedemptions: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              placeholder="مثال: 100"
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
              تفعيل هذه المكافأة
            </label>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-700">
              ⭐ المستخدمون سيحتاجون {formData.points || 0} نقطة لاسترجاع "
              {formData.name || "المكافأة"}"
            </p>
          </div>
        </CardContent>

        <div className="flex gap-2 p-6 border-t bg-gray-50">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
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
