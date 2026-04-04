import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIRecommendationReasonCardProps {
  reason: string;
  matchScore: number;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'from-green-400 to-emerald-600 text-green-50 border-green-300';
  if (score >= 70) return 'from-blue-400 to-indigo-600 text-blue-50 border-blue-300';
  if (score >= 50) return 'from-amber-400 to-orange-600 text-amber-50 border-amber-300';
  return 'from-gray-400 to-slate-600 text-gray-50 border-gray-300';
};

const AIRecommendationReasonCard: React.FC<AIRecommendationReasonCardProps> = ({
  reason,
  matchScore,
}) => {
  const gradientClass = getScoreColor(matchScore);

  return (
    <div className={`mt-3 rounded-xl border bg-gradient-to-r p-4 ${gradientClass} bg-opacity-10`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              AI 推荐理由
            </span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {matchScore}% 匹配
            </span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationReasonCard;
