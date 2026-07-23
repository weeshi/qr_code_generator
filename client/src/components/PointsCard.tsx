import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Zap } from "lucide-react";

interface PointsCardProps {
  totalPoints: number;
  availablePoints: number;
  tier: string;
  nextTierPoints?: number;
}

const tierConfig = {
  bronze: {
    name: "برونزي",
    color: "from-amber-600 to-amber-700",
    icon: "🥉",
    minPoints: 0,
    maxPoints: 500,
  },
  silver: {
    name: "فضي",
    color: "from-gray-400 to-gray-500",
    icon: "🥈",
    minPoints: 500,
    maxPoints: 1000,
  },
  gold: {
    name: "ذهبي",
    color: "from-yellow-400 to-yellow-600",
    icon: "🥇",
    minPoints: 1000,
    maxPoints: 2000,
  },
  platinum: {
    name: "بلاتيني",
    color: "from-blue-400 to-blue-600",
    icon: "💎",
    minPoints: 2000,
    maxPoints: Infinity,
  },
};

export default function PointsCard({
  totalPoints,
  availablePoints,
  tier,
  nextTierPoints,
}: PointsCardProps) {
  const tierInfo = tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronze;
  const nextTier = tier === "platinum" ? null : Object.entries(tierConfig).find(
    ([_, config]) => config.minPoints > tierInfo.minPoints
  );
  
  const nextTierThreshold = nextTier ? nextTier[1].minPoints : tierInfo.maxPoints;
  const pointsToNextTier = Math.max(0, nextTierThreshold - totalPoints);
  const progressPercent = Math.min(
    100,
    ((totalPoints - tierInfo.minPoints) / (nextTierThreshold - tierInfo.minPoints)) * 100
  );

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              نقاطك
            </CardTitle>
            <CardDescription>تابع تقدمك واكسب المزيد من النقاط</CardDescription>
          </div>
          <div className="text-4xl">{tierInfo.icon}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Points Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">إجمالي النقاط</p>
            <p className="text-3xl font-bold text-blue-600">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">النقاط المتاحة</p>
            <p className="text-3xl font-bold text-green-600">{availablePoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Tier Information */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-600">المستوى الحالي</p>
              <p className="text-xl font-bold text-slate-900">{tierInfo.name}</p>
            </div>
            <div className="text-3xl">{tierInfo.icon}</div>
          </div>

          {/* Progress Bar */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">التقدم نحو {nextTier[1].name}</span>
                <span className="font-semibold text-slate-900">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {pointsToNextTier.toLocaleString()} نقطة متبقية
              </p>
            </div>
          )}

          {tier === "platinum" && (
            <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mt-3">
              <Zap className="w-4 h-4" />
              أنت في أعلى مستوى! 🎉
            </div>
          )}
        </div>

        {/* Tier Benefits */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 mb-1">مزايا هذا المستوى</p>
              <ul className="text-sm text-slate-700 space-y-1">
                {tier === "bronze" && (
                  <>
                    <li>✓ 50 نقطة لكل رمز QR تنشئه</li>
                    <li>✓ 25 نقطة لكل رمز تمسحه</li>
                  </>
                )}
                {tier === "silver" && (
                  <>
                    <li>✓ 60 نقطة لكل رمز QR تنشئه</li>
                    <li>✓ 30 نقطة لكل رمز تمسحه</li>
                    <li>✓ خصم 5% على المكافآت</li>
                  </>
                )}
                {tier === "gold" && (
                  <>
                    <li>✓ 75 نقطة لكل رمز QR تنشئه</li>
                    <li>✓ 35 نقطة لكل رمز تمسحه</li>
                    <li>✓ خصم 10% على المكافآت</li>
                    <li>✓ وصول مبكر لميزات جديدة</li>
                  </>
                )}
                {tier === "platinum" && (
                  <>
                    <li>✓ 100 نقطة لكل رمز QR تنشئه</li>
                    <li>✓ 50 نقطة لكل رمز تمسحه</li>
                    <li>✓ خصم 20% على المكافآت</li>
                    <li>✓ وصول حصري لميزات VIP</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
