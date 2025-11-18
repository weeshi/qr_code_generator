import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Trash2, Copy, ExternalLink, Search, Trash } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ScanHistory() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Fetch scan history
  const { data: history = [], isLoading, refetch } = trpc.qrCode.getHistory.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated }
  );

  // Delete history item mutation
  const deleteItemMutation = trpc.qrCode.deleteHistoryItem.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Clear all history mutation
  const clearHistoryMutation = trpc.qrCode.clearHistory.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Filter and search
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = item.scannedData.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "url" && item.scannedData.startsWith("http")) ||
        (selectedFilter === "text" && !item.scannedData.startsWith("http"));
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, selectedFilter]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Open link
  const openLink = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    }
  };

  // Delete item
  const handleDeleteItem = (id: number) => {
    if (confirm("هل تريد حذف هذا العنصر؟")) {
      deleteItemMutation.mutate({ id });
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (confirm("هل تريد حذف كل السجل؟ لا يمكن التراجع عن هذا الإجراء.")) {
      clearHistoryMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">يجب تسجيل الدخول لعرض سجل المسحات.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              العودة إلى الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">سجل المسحات</h1>
          </div>
          <p className="text-gray-600">عرض جميع رموز QR التي تم مسحها</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <Label className="mb-2 block">البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن محتوى QR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <Label className="mb-2 block">النوع</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("all")}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  variant={selectedFilter === "url" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("url")}
                  size="sm"
                >
                  روابط
                </Button>
                <Button
                  variant={selectedFilter === "text" ? "default" : "outline"}
                  onClick={() => setSelectedFilter("text")}
                  size="sm"
                >
                  نصوص
                </Button>
              </div>
            </div>

            {/* Clear All Button */}
            {history.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="w-full gap-2"
                disabled={clearHistoryMutation.isPending}
              >
                <Trash className="w-4 h-4" />
                حذف كل السجل
              </Button>
            )}
          </CardContent>
        </Card>

        {/* History List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد عناصر في السجل</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(item.scannedAt).toLocaleString("ar-SA")}
                      </p>
                      <p className="text-gray-900 break-all font-mono text-sm">
                        {item.scannedData}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => copyToClipboard(item.scannedData)}
                        variant="outline"
                        size="sm"
                        title="نسخ"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {item.scannedData.startsWith("http") && (
                        <Button
                          onClick={() => openLink(item.scannedData)}
                          variant="outline"
                          size="sm"
                          title="فتح الرابط"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        variant="destructive"
                        size="sm"
                        title="حذف"
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {history.length > 0 && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{history.length}</p>
                  <p className="text-sm text-gray-600">إجمالي المسحات</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {history.filter((h) => h.scannedData.startsWith("http")).length}
                  </p>
                  <p className="text-sm text-gray-600">روابط</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <Button onClick={() => navigate("/")} variant="outline" className="w-full mt-6">
          العودة إلى الرئيسية
        </Button>
      </div>
    </div>
  );
}
