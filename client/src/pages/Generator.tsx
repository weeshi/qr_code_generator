import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Share2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface GeneratorProps {
  type: string;
}

export default function Generator({ type }: GeneratorProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [qrName, setQrName] = useState("");
  const [generatedQR, setGeneratedQR] = useState<{ dataUrl: string; svg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.qrCode.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedQR({ dataUrl: data.dataUrl, svg: data.svg });
      toast.success("تم إنشاء رمز QR بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!qrName.trim()) {
      toast.error("يرجى إدخال اسم لرمز QR");
      return;
    }

    generateMutation.mutate({
      type,
      name: qrName,
      content: formData,
    });
  };

  const handleDownload = () => {
    if (!generatedQR) return;

    const link = document.createElement("a");
    link.href = generatedQR.dataUrl;
    link.download = `${qrName || "qrcode"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تحميل رمز QR");
  };

  const handleCopy = () => {
    if (!generatedQR) return;
    navigator.clipboard.writeText(generatedQR.dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم نسخ الصورة");
  };

  const renderFormFields = () => {
    switch (type) {
      case "vcard":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم الأول</Label>
                <Input
                  value={formData.firstName || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="أحمد"
                />
              </div>
              <div>
                <Label>الاسم الأخير</Label>
                <Input
                  value={formData.lastName || ""}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="محمد"
                />
              </div>
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label>المنظمة</Label>
              <Input
                value={formData.organization || ""}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="اسم الشركة"
              />
            </div>
            <div>
              <Label>الموقع الإلكتروني</Label>
              <Input
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </>
        );

      case "url":
        return (
          <div>
            <Label>الرابط</Label>
            <Input
              value={formData.url || ""}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        );

      case "wifi":
        return (
          <>
            <div>
              <Label>اسم الشبكة (SSID)</Label>
              <Input
                value={formData.ssid || ""}
                onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                placeholder="WiFi Network"
              />
            </div>
            <div>
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>نوع الأمان</Label>
              <select
                value={formData.security || "WPA"}
                onChange={(e) => setFormData({ ...formData, security: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="WPA">WPA</option>
                <option value="WEP">WEP</option>
                <option value="nopass">بدون كلمة مرور</option>
              </select>
            </div>
          </>
        );

      case "whatsapp":
        return (
          <>
            <div>
              <Label>رقم الهاتف</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label>الرسالة (اختياري)</Label>
              <Textarea
                value={formData.message || ""}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="أدخل الرسالة الافتراضية"
              />
            </div>
          </>
        );

      case "email":
        return (
          <>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label>الموضوع</Label>
              <Input
                value={formData.subject || ""}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="موضوع البريد"
              />
            </div>
            <div>
              <Label>الرسالة</Label>
              <Textarea
                value={formData.body || ""}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="محتوى البريد"
              />
            </div>
          </>
        );

      case "phone":
        return (
          <div>
            <Label>رقم الهاتف</Label>
            <Input
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+966501234567"
            />
          </div>
        );

      default:
        return (
          <div>
            <Label>المحتوى</Label>
            <Textarea
              value={formData.text || ""}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="أدخل المحتوى"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>إنشاء رمز QR</CardTitle>
              <CardDescription>أدخل المعلومات المطلوبة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم رمز QR</Label>
                <Input
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="مثال: بطاقة عملي"
                />
              </div>

              {renderFormFields()}

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء رمز QR"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>معاينة</CardTitle>
              <CardDescription>سيظهر رمز QR هنا</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-96">
              {generatedQR ? (
                <div className="w-full space-y-4">
                  <img
                    src={generatedQR.dataUrl}
                    alt="QR Code"
                    className="w-full max-w-sm mx-auto border rounded-lg p-4 bg-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      تحميل
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          نسخ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>أدخل المعلومات وانقر على "إنشاء رمز QR"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
