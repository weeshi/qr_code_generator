import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Share2, Loader2, Copy, Check, Upload, Eye } from "lucide-react";
import { toast } from "sonner";

interface GeneratorProps {
  type: string;
}

export default function Generator({ type }: GeneratorProps) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [qrName, setQrName] = useState("");
  const [generatedQR, setGeneratedQR] = useState<{ dataUrl: string; svg: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [templateHtml, setTemplateHtml] = useState<string | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const generateMutation = trpc.qrCode.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedQR({ dataUrl: data.dataUrl, svg: data.svg });
      toast.success("تم إنشاء رمز QR بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const uploadFileMutation = trpc.qrCode.uploadFile.useMutation({
    onSuccess: (data) => {
      setUploadedFile(data.file);
      setFormData({ ...formData, url: data.file.url });
      toast.success("تم رفع الملف بنجاح");
    },
    onError: (error) => {
      toast.error(`خطأ في رفع الملف: ${error.message}`);
    },
  });

  const getVCardTemplateMutation = trpc.templates.vcard.useQuery(
    {
      firstName: formData.firstName as string || "",
      lastName: formData.lastName as string || "",
      phone: formData.phone as string,
      email: formData.email as string,
      organization: formData.organization as string,
      url: formData.url as string,
      address: formData.address as string,
      qrCodeUrl: generatedQR?.dataUrl,
    },
    { enabled: false }
  );

  const getSocialMediaTemplateMutation = trpc.templates.socialMedia.useQuery(
    {
      name: formData.name as string || "",
      bio: formData.bio as string,
      instagram: formData.instagram as string,
      facebook: formData.facebook as string,
      twitter: formData.twitter as string,
      linkedin: formData.linkedin as string,
      tiktok: formData.tiktok as string,
      youtube: formData.youtube as string,
      qrCodeUrl: generatedQR?.dataUrl,
    },
    { enabled: false }
  );

  const getBusinessTemplateMutation = trpc.templates.business.useQuery(
    {
      companyName: formData.companyName as string || "",
      description: formData.description as string,
      industry: formData.industry as string,
      website: formData.website as string,
      phone: formData.phone as string,
      email: formData.email as string,
      address: formData.address as string,
      logo: formData.logo as string,
      qrCodeUrl: generatedQR?.dataUrl,
    },
    { enabled: false }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];

        uploadFileMutation.mutate({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
          type: type as "pdf" | "image" | "video" | "audio",
        });
      } catch (error) {
        toast.error("خطأ في قراءة الملف");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!qrName.trim()) {
      toast.error("يرجى إدخال اسم لرمز QR");
      return;
    }

    const contentData: Record<string, any> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string") {
        contentData[key] = value;
      }
    });

    generateMutation.mutate({
      type,
      name: qrName,
      content: contentData,
    });
  };

  const handleShowTemplate = async () => {
    if (!generatedQR) {
      toast.error("يرجى إنشاء رمز QR أولاً");
      return;
    }

    let mutation: any = null;

    switch (type) {
      case "vcard":
        await getVCardTemplateMutation.refetch();
        setTemplateHtml(getVCardTemplateMutation.data?.html || null);
        break;
      case "social":
        await getSocialMediaTemplateMutation.refetch();
        setTemplateHtml(getSocialMediaTemplateMutation.data?.html || null);
        break;
      case "business":
        await getBusinessTemplateMutation.refetch();
        setTemplateHtml(getBusinessTemplateMutation.data?.html || null);
        break;
      default:
        toast.error("لا توجد قالب متاح لهذا النوع");
        return;
    }

    setShowTemplate(true);
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
                  value={(formData.firstName as string) || ""}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="أحمد"
                />
              </div>
              <div>
                <Label>الاسم الأخير</Label>
                <Input
                  value={(formData.lastName as string) || ""}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="محمد"
                />
              </div>
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                  value={(formData.email as string) || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <Label>رقم الهاتف</Label>
              <Input
                  value={(formData.phone as string) || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label>المنظمة</Label>
              <Input
                  value={(formData.organization as string) || ""}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="اسم الشركة"
              />
            </div>
            <div>
              <Label>الموقع الإلكتروني</Label>
              <Input
                value={(formData.url as string) || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={(formData.address as string) || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان الكامل"
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

      case "pdf":
      case "image":
      case "video":
      case "mp3":
        return (
          <div>
            <Label>رفع الملف</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileUpload}
                accept={
                  type === "pdf"
                    ? ".pdf"
                    : type === "image"
                    ? "image/*"
                    : type === "video"
                    ? "video/*"
                    : "audio/*"
                }
                disabled={uploadFileMutation.isPending}
              />
              {uploadFileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
            {uploadedFile && (
              <p className="text-sm text-green-600 mt-2">✓ تم رفع الملف: {uploadedFile.fileName}</p>
            )}
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

      case "social":
        return (
          <>
            <div>
              <Label>الاسم</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسمك"
              />
            </div>
            <div>
              <Label>السيرة الذاتية (اختياري)</Label>
              <Textarea
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="نبذة عنك"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instagram</Label>
                <Input
                  value={formData.instagram || ""}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input
                  value={formData.facebook || ""}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label>Twitter</Label>
                <Input
                  value={formData.twitter || ""}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input
                  value={formData.linkedin || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="username"
                />
              </div>
            </div>
          </>
        );

      case "business":
        return (
          <>
            <div>
              <Label>اسم الشركة</Label>
              <Input
                value={formData.companyName || ""}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="اسم شركتك"
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الشركة"
              />
            </div>
            <div>
              <Label>المجال</Label>
              <Input
                value={formData.industry || ""}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="مجال العمل"
              />
            </div>
            <div>
              <Label>الموقع الإلكتروني</Label>
              <Input
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان الكامل"
              />
            </div>
          </>
        );

      case "coupon":
        return (
          <>
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان القسيمة"
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف القسيمة"
              />
            </div>
            <div>
              <Label>الخصم</Label>
              <Input
                value={formData.discount || ""}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="50% خصم"
              />
            </div>
            <div>
              <Label>رمز القسيمة</Label>
              <Input
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SAVE50"
              />
            </div>
            <div>
              <Label>صالح حتى</Label>
              <Input
                type="date"
                value={formData.validUntil || ""}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </>
        );

      case "menu":
        return (
          <>
            <div>
              <Label>اسم المطعم</Label>
              <Input
                value={formData.restaurantName || ""}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                placeholder="اسم المطعم"
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف المطعم"
              />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان الكامل"
              />
            </div>
          </>
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

  if (showTemplate && templateHtml) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setShowTemplate(false)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة
          </button>

          <Card>
            <CardHeader>
              <CardTitle>معاينة القالب</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                srcDoc={templateHtml}
                className="w-full h-screen border rounded-lg"
                title="Template Preview"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 min-w-fit"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      تحميل
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="flex-1 min-w-fit"
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
                    {["vcard", "social", "business"].includes(type) && (
                      <Button
                        onClick={handleShowTemplate}
                        variant="outline"
                        className="flex-1 min-w-fit"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض القالب
                      </Button>
                    )}
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
