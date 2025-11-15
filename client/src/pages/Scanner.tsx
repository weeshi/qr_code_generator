import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, Upload, X, CheckCircle, Mail, MessageSquare, Share2 } from "lucide-react";
import jsQR from "jsqr";

interface ScanResult {
  data: string;
  timestamp: Date;
}

export default function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        startScanningFromCamera();
      }
    } catch (err) {
      setError("لا يمكن الوصول إلى الكاميرة. يرجى التحقق من الأذونات.");
      console.error("Camera error:", err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      setIsScanning(false);
    }
  };

  // Scan from camera
  const startScanningFromCamera = () => {
    setIsScanning(true);
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && isCameraActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScanResult({
              data: code.data,
              timestamp: new Date(),
            });
            setIsScanning(false);
            stopCamera();
            clearInterval(scanInterval);
          }
        }
      }
    }, 500);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
              setScanResult({
                data: code.data,
                timestamp: new Date(),
              });
            } else {
              setError("لم يتم العثور على رمز QR في الصورة");
            }
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult.data);
    }
  };

  // Share via email
  const shareViaEmail = () => {
    if (scanResult) {
      const subject = encodeURIComponent("محتوى رمز QR");
      const body = encodeURIComponent(`محتوى رمز QR الممسوح:\n\n${scanResult.data}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShowShareMenu(false);
    }
  };

  // Share via SMS
  const shareViaSMS = () => {
    if (scanResult) {
      const message = encodeURIComponent(`محتوى رمز QR: ${scanResult.data}`);
      window.location.href = `sms:?body=${message}`;
      setShowShareMenu(false);
    }
  };

  // Share via Web Share API
  const shareViaWebShare = async () => {
    if (scanResult && navigator.share) {
      try {
        await navigator.share({
          title: "محتوى رمز QR",
          text: `محتوى رمز QR الممسوح: ${scanResult.data}`,
        });
        setShowShareMenu(false);
      } catch (err) {
        console.error("Share error:", err);
      }
    }
  };

  // Open link
  const openLink = () => {
    if (scanResult) {
      try {
        window.open(scanResult.data, "_blank");
      } catch {
        setError("لا يمكن فتح الرابط");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ماسح رموز QR</h1>
          </div>
          <p className="text-gray-600">امسح رموز QR باستخدام الكاميرة أو برفع صورة</p>
        </div>

        {/* Scanner Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ماسح الكاميرا</CardTitle>
            <CardDescription>استخدم الكاميرا لمسح رموز QR</CardDescription>
          </CardHeader>
          <CardContent>
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Camera className="w-4 h-4 mr-2" />
                تشغيل الكاميرا
              </Button>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg bg-black"
                  style={{ aspectRatio: "4/3" }}
                />
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  إيقاف الكاميرا
                </Button>
                {isScanning && (
                  <p className="text-center text-sm text-gray-600">جاري البحث عن رموز QR...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>رفع صورة</CardTitle>
            <CardDescription>اختر صورة تحتوي على رمز QR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                اختر صورة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                className="w-full mt-2"
              >
                إغلاق
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scan Result */}
        {scanResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-900">تم مسح رمز QR بنجاح</CardTitle>
              </div>
              <CardDescription>
                {scanResult.timestamp.toLocaleTimeString("ar-SA")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">محتوى رمز QR:</p>
                  <p className="text-lg font-mono break-all text-gray-900">
                    {scanResult.data}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1"
                    >
                      نسخ
                    </Button>
                    {(scanResult.data.startsWith("http://") ||
                      scanResult.data.startsWith("https://")) && (
                      <Button onClick={openLink} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        فتح الرابط
                      </Button>
                    )}
                    <Button
                      onClick={() => setScanResult(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      مسح جديد
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    مشاركة
                  </Button>
                  {showShareMenu && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg space-y-1">
                      <Button
                        onClick={shareViaEmail}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        مشاركة عبر البريد الإلكتروني
                      </Button>
                      <Button
                        onClick={shareViaSMS}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        مشاركة عبر الرسائل النصية
                      </Button>
                      {'share' in navigator && (
                        <Button
                          onClick={shareViaWebShare}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          مشاركة أخرى
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden Canvas for QR Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
