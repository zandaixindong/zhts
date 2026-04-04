import React, { useState, useEffect } from 'react';
import { Sparkles, Award } from 'lucide-react';
import { myActivityApi } from '../../../utils/api';
import { useStore } from '../../../store/useStore';

interface PersonaData {
  title: string;
  traits: string[];
  radar: Record<string, number>;
  summary: string;
}

const AIPersonaCard: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const [data, setData] = useState<PersonaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      myActivityApi.getPersona(currentUser.id)
        .then(res => {
          if (isMounted && res.data) {
            setData(res.data);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="card-modern p-6 bg-gradient-to-r from-indigo-50 to-purple-50 animate-pulse">
        <div className="h-6 bg-indigo-100 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-indigo-100 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="card-modern relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white p-6 shadow-xl mb-6">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-indigo-100 uppercase tracking-widest text-xs font-bold">
          <Sparkles className="w-4 h-4" /> AI 年度借阅画像
        </div>
        
        <h3 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
          {data.title}
          <Award className="text-yellow-300 w-8 h-8" />
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {data.traits.map(trait => (
            <span key={trait} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
              #{trait}
            </span>
          ))}
        </div>
        
        <p className="text-indigo-50 text-base leading-relaxed bg-black/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
          {data.summary}
        </p>
      </div>
    </div>
  );
};

export default AIPersonaCard;