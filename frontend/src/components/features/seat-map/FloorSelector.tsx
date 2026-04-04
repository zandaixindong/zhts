import React, { useState, useEffect } from 'react';
import { getFloors } from '../../../utils/api';
import type { Floor } from '../../../types';
import { useStore } from '../../../store/useStore';

interface FloorSelectorProps {
  onFloorSelected: (floor: Floor) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({ onFloorSelected }) => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedFloor = useStore(state => state.selectedFloor);
  const setSelectedFloor = useStore(state => state.setSelectedFloor);

  useEffect(() => {
    loadFloors();
  }, []);

  const loadFloors = async () => {
    try {
      const data = await getFloors();
      setFloors(data);
      if (data.length > 0 && !selectedFloor) {
        setSelectedFloor(data[0]);
        onFloorSelected(data[0]);
      }
    } catch (e) {
      console.error('Error loading floors:', e);
      setError('加载楼层失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (floor: Floor) => {
    setSelectedFloor(floor);
    onFloorSelected(floor);
  };

  if (loading) {
    return <div className="py-4 text-center text-slate-500">加载中...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {floors.map((floor) => (
        <button
          key={floor.id}
          onClick={() => handleSelect(floor)}
          className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
            selectedFloor?.id === floor.id
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.7)]'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {floor.name}
        </button>
      ))}
    </div>
  );
};

export default FloorSelector;
