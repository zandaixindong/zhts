import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIRecommendationReasonCard from '../AIRecommendationReasonCard';

describe('AIRecommendationReasonCard', () => {
  it('renders the reason and match score correctly', () => {
    render(
      <AIRecommendationReasonCard
        reason="这本书非常符合你的阅读兴趣，主题和你之前标记喜欢的书籍相近。"
        matchScore={85}
      />
    );

    expect(screen.getByText('AI 推荐理由')).toBeInTheDocument();
    expect(screen.getByText('这本书非常符合你的阅读兴趣，主题和你之前标记喜欢的书籍相近。')).toBeInTheDocument();
    expect(screen.getByText('85% 匹配')).toBeInTheDocument();
  });

  it('applies correct gradient based on score', () => {
    const { container } = render(
      <AIRecommendationReasonCard
        reason="Test"
        matchScore={95}
      />
    );

    expect(container.firstChild).toHaveClass('from-green-400');
  });

  it('handles empty reason gracefully', () => {
    render(
      <AIRecommendationReasonCard
        reason=""
        matchScore={50}
      />
    );

    expect(screen.getByText('AI 推荐理由')).toBeInTheDocument();
    expect(screen.getByText('50% 匹配')).toBeInTheDocument();
  });
});
