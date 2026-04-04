import React, { useState, useRef } from 'react';
import { Trash2, Save, X } from 'lucide-react';
import type { Floor } from '../../types';

export interface PlanAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface FloorPlanEditorProps {
  floor: Floor;
  seats: Array<{ id: string; x: number; y: number }>;
  onSave: (data: {
    width: number;
    height: number;
    planAnnotations: PlanAnnotation[];
  }, updatedSeats?: Array<{ id: string; x: number; y: number }>) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f59e0b', // orange
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  floor,
  seats,
  onSave,
  onCancel,
}) => {
  const [width, setWidth] = useState<number>(floor.width || 100);
  const [height, setHeight] = useState<number>(floor.height || 80);
  const [annotations, setAnnotations] = useState<PlanAnnotation[]>(() => {
    if (floor.planAnnotations) {
      try {
        if (typeof floor.planAnnotations === 'string') {
          return JSON.parse(floor.planAnnotations);
        }
        return floor.planAnnotations as unknown as PlanAnnotation[];
      } catch (_error) {
        return [];
      }
    }
    return [];
  });
  
  const [localSeats, setLocalSeats] = useState(seats);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    type: 'resize' | 'move' | null;
    annotationId: string | null;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startLeft: number;
    startTop: number;
  } | null>(null);
  
  const [seatDragState, setSeatDragState] = useState<{
    seatId: string;
    startX: number;
    startY: number;
    startSeatX: number;
    startSeatY: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getSVGPoint = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const addAnnotation = (e: React.MouseEvent) => {
    if (e.defaultPrevented || dragState || seatDragState) return;
    
    const { x, y } = getSVGPoint(e);
    const newAnnotation: PlanAnnotation = {
      id: Date.now().toString(),
      x: Math.round(x - 10),
      y: Math.round(y - 10),
      width: 20,
      height: 20,
      label: `区域 ${annotations.length + 1}`,
      color: DEFAULT_COLORS[annotations.length % DEFAULT_COLORS.length],
    };
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setSelectedSeat(null);
  };

  const deleteSelected = () => {
    if (!selectedAnnotation) return;
    setAnnotations(annotations.filter(a => a.id !== selectedAnnotation));
    setSelectedAnnotation(null);
  };

  const handleAnnotationMouseDown = (
    e: React.MouseEvent,
    annotation: PlanAnnotation,
    type: 'resize' | 'move'
  ) => {
    e.stopPropagation();
    const { x, y } = getSVGPoint(e);
    setDragState({
      type,
      annotationId: annotation.id,
      startX: x,
      startY: y,
      startWidth: annotation.width,
      startHeight: annotation.height,
      startLeft: annotation.x,
      startTop: annotation.y,
    });
    setSelectedAnnotation(annotation.id);
    setSelectedSeat(null);
  };

  const handleSeatMouseDown = (e: React.MouseEvent, seatId: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    e.preventDefault();
    const { x, y } = getSVGPoint(e);
    setSeatDragState({
      seatId,
      startX: x,
      startY: y,
      startSeatX: currentX,
      startSeatY: currentY,
    });
    setSelectedSeat(seatId);
    setSelectedAnnotation(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getSVGPoint(e);

    if (dragState) {
      const dx = x - dragState.startX;
      const dy = y - dragState.startY;

      setAnnotations(annotations.map(a => {
        if (a.id !== dragState.annotationId) return a;
        if (dragState.type === 'move') {
          return {
            ...a,
            x: dragState.startLeft + dx,
            y: dragState.startTop + dy,
          };
        } else {
          return {
            ...a,
            width: Math.max(10, dragState.startWidth + dx),
            height: Math.max(10, dragState.startHeight + dy),
          };
        }
      }));
    } else if (seatDragState) {
      const dx = x - seatDragState.startX;
      const dy = y - seatDragState.startY;
      
      setLocalSeats(localSeats.map(seat => {
        if (seat.id !== seatDragState.seatId) return seat;
        return {
          ...seat,
          x: seatDragState.startSeatX + dx,
          y: seatDragState.startSeatY + dy,
        };
      }));
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
    setSeatDragState(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        width,
        height,
        planAnnotations: annotations,
      }, localSeats);
    } finally {
      setIsSaving(false);
    }
  };

  const updateAnnotationLabel = (id: string, label: string) => {
    setAnnotations(annotations.map(a => a.id === id ? { ...a, label } : a));
  };

  const updateAnnotationColor = (id: string, color: string) => {
    setAnnotations(annotations.map(a => a.id === id ? { ...a, color } : a));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">平面图编辑器</h3>
          <p className="text-sm text-slate-500">
            {floor.name} - 点击空白添加区域标注，直接拖拽点位可移动座位
          </p>
        </div>
        <button
          onClick={onCancel}
          className="btn-secondary rounded-lg px-3 py-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">画布宽度</label>
          <input
            type="number"
            value={width}
            onChange={e => setWidth(Math.max(50, Number(e.target.value)))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">画布高度</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(Math.max(40, Number(e.target.value)))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div
        className="relative mb-4 overflow-auto rounded-xl border border-slate-300 bg-slate-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          width={width * 8}
          height={height * 8}
          onClick={addAnnotation}
          className="bg-white"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {annotations.map(annotation => {
            const isSelected = annotation.id === selectedAnnotation;
            return (
              <g
                key={annotation.id}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedAnnotation(annotation.id);
                  setSelectedSeat(null);
                }}
                className="cursor-move"
                onMouseDown={e => handleAnnotationMouseDown(e, annotation, 'move')}
              >
                <rect
                  x={annotation.x}
                  y={annotation.y}
                  width={annotation.width}
                  height={annotation.height}
                  fill={annotation.color}
                  fillOpacity={0.3}
                  stroke={annotation.color}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={annotation.x + 2}
                  y={annotation.y + 4}
                  fontSize={3}
                  fill={annotation.color.replace(/[^#\w]/g, '')}
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {annotation.label}
                </text>
                {isSelected && (
                  <rect
                    x={annotation.x + annotation.width - 2}
                    y={annotation.y + annotation.height - 2}
                    width={4}
                    height={4}
                    fill={annotation.color}
                    className="cursor-se-resize"
                    onMouseDown={e => handleAnnotationMouseDown(e, annotation, 'resize')}
                  />
                )}
              </g>
            );
          })}
          
          {localSeats.map(seat => (
            <g
              key={seat.id}
              transform={`translate(${seat.x}, ${seat.y})`}
              className="cursor-move"
              onMouseDown={(e) => handleSeatMouseDown(e, seat.id, seat.x, seat.y)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSeat(seat.id);
                setSelectedAnnotation(null);
              }}
            >
              <circle
                r="1.5"
                fill={selectedSeat === seat.id ? "#3b82f6" : "#64748b"}
                stroke={selectedSeat === seat.id ? "#2563eb" : "none"}
                strokeWidth="0.5"
                opacity={selectedSeat === seat.id ? "1" : "0.7"}
              />
              <circle r="4" fill="transparent" />
            </g>
          ))}
        </svg>
      </div>

      {selectedAnnotation && (
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">编辑区域</h4>
            <button
              onClick={deleteSelected}
              className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700">区域名称</label>
            <input
              type="text"
              value={annotations.find(a => a.id === selectedAnnotation)?.label || ''}
              onChange={e => updateAnnotationLabel(selectedAnnotation, e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700">颜色</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateAnnotationColor(selectedAnnotation, color)}
                  className={`h-8 w-8 rounded-full border-2 ${
                    annotations.find(a => a.id === selectedAnnotation)?.color === color
                      ? 'border-slate-900'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`颜色 ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedSeat && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
          <h4 className="font-medium text-blue-900">已选中 1 个座位</h4>
          <p className="text-sm text-blue-700 mt-1">您可以直接在上方平面图中拖拽移动该座位的位置。点击保存后，座位的新坐标将同步至数据库。</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="btn-secondary rounded-lg px-4 py-2"
          disabled={isSaving}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="btn-primary rounded-lg px-4 py-2 inline-flex items-center gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存平面图
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FloorPlanEditor;