import React, { useState } from 'react';
import { Info } from 'lucide-react';
import type { Recommendation } from '../../../types';
import AIRecommendationReasonCard from './AIRecommendationReasonCard';
import BookSummary from './BookSummary';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [showSummary, setShowSummary] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="card-modern p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
            <p className="text-sm text-gray-600">{recommendation.author}</p>
            <AIRecommendationReasonCard
              reason={recommendation.reason}
              matchScore={recommendation.matchScore}
            />
          </div>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(recommendation.matchScore)}`}>
            匹配度 {recommendation.matchScore}%
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowSummary(true)}
            className="btn-secondary inline-flex items-center px-3 py-2 text-sm leading-4 font-medium"
          >
            <Info className="w-4 h-4 mr-2" />
            AI 导读
          </button>
        </div>
      </div>

      {showSummary && (
        <BookSummary
          bookId={recommendation.bookId}
          title={`${recommendation.title} - ${recommendation.author}`}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
};

export default RecommendationCard;
