import React from 'react';
import { Lightbulb, CheckSquare } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

export const AIRecommendations: React.FC = () => {
  const { recommendations } = useAppSelector((state) => state.ai);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          AI Recommendations
        </h3>
      </div>

      <ul className="space-y-2">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
            <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
