import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Map, Layout, Power, Wind, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../utils/api';
import type { Floor, Seat } from '../../types';
import FloorPlanEditor from './FloorPlanEditor';

const SeatManager: React.FC = () => {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [floorModal, setFloorModal] = useState<{ mode: 'add' | 'edit'; floor?: Floor } | null>(null);
  const [seatModal, setSeatModal] = useState<{ mode: 'add' | 'edit'; seat?: Seat } | null>(null);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [floorForm, setFloorForm] = useState({ number: 1, name: '' });
  const [seatForm, setSeatForm] = useState({ seatNumber: '', x: 0, y: 0, hasOutlet: false, zone: 'quiet', window: false, status: 'available' });

  const fetchFloors = async () => {
    setLoading(true);
    try { 
      const data = await adminApi.getFloors();
      setFloors(data);
      if (data.length > 0 && !selectedFloor) {
        setSelectedFloor(data[0].id);
      }
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFloors(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSeats = async (floorId: string) => {
    try { 
      const data = await adminApi.getSeats(floorId);
      setSeats(data);
    } catch (e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    if (selectedFloor) {
      fetchSeats(selectedFloor);
    }
  }, [selectedFloor]);

  const saveFloor = async () => {
    try {
      if (floorModal?.mode === 'add') await adminApi.createFloor(floorForm);
      else if (floorModal?.floor) await adminApi.updateFloor(floorModal.floor.id, floorForm);
      setFloorModal(null);
      fetchFloors();
    } catch (e) { console.error(e); }
  };

  const deleteFloor = async (id: string) => {
    if (!confirm('删除楼层将同时删除该楼层所有座位，确认？')) return;
    try {
      await adminApi.deleteFloor(id);
      if (selectedFloor === id) setSelectedFloor('');
      fetchFloors();
    } catch (e) { console.error(e); }
  };

  const saveSeat = async () => {
    try {
      const data = { ...seatForm, floorId: selectedFloor };
      if (seatModal?.mode === 'add') await adminApi.createSeat(data);
      else if (seatModal?.seat) await adminApi.updateSeat(seatModal.seat.id, data);
      setSeatModal(null);
      fetchSeats(selectedFloor);
    } catch (e) { console.error(e); }
  };

  const deleteSeat = async (id: string) => {
    try {
      await adminApi.deleteSeat(id);
      fetchSeats(selectedFloor);
    } catch (e) { console.error(e); }
  };

  const openAddFloor = () => { setFloorForm({ number: floors.length + 1, name: '' }); setFloorModal({ mode: 'add' }); };
  const openEditFloor = (f: Floor) => { setFloorForm({ number: f.number, name: f.name }); setFloorModal({ mode: 'edit', floor: f }); };
  const openAddSeat = () => { setSeatForm({ seatNumber: '', x: 0, y: 0, hasOutlet: false, zone: 'quiet', window: false, status: 'available' }); setSeatModal({ mode: 'add' }); };
  const openEditSeat = (s: Seat) => { setSeatForm(s); setSeatModal({ mode: 'edit', seat: s }); };

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="h-12 w-full animate-pulse bg-slate-100 rounded-xl" />
      <div className="h-64 w-full animate-pulse bg-slate-100 rounded-2xl" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Floor tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {floors.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFloor(f.id)}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              selectedFloor === f.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layout className={`w-4 h-4 ${selectedFloor === f.id ? 'text-indigo-200' : 'text-slate-400'}`} />
            {f.name}
            {selectedFloor === f.id && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />}
          </button>
        ))}
        <button 
          onClick={openAddFloor} 
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 border border-dashed border-indigo-300 hover:bg-indigo-50 transition-all hover:border-indigo-500"
        >
          <Plus className="w-4 h-4" /> 新增楼层
        </button>
        
        {floors.find(f => f.id === selectedFloor) && (
          <div className="flex items-center gap-1 ml-auto bg-slate-100/50 p-1 rounded-xl">
            <button 
              onClick={() => openEditFloor(floors.find(f => f.id === selectedFloor)!)} 
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all"
              title="编辑楼层信息"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPlanEditorOpen(true)} 
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-purple-600 transition-all" 
              title="可视化平面图编辑器"
            >
              <Map className="w-4 h-4" />
            </button>
            <button 
              onClick={() => deleteFloor(selectedFloor)} 
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-rose-600 transition-all"
              title="删除楼层"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Seats Content */}
      {selectedFloor ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">
                当前楼层座位总数：<span className="text-indigo-600">{seats.length}</span>
              </h3>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 空闲 {seats.filter(s => s.status === 'available').length}
                </span>
                <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> 占用 {seats.filter(s => s.status !== 'available').length}
                </span>
              </div>
            </div>
            <button 
              onClick={openAddSeat} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-200"
            >
              <Plus className="w-3.5 h-3.5" /> 快速添加座位
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-left text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="px-6 py-4">座位号</th>
                    <th className="px-6 py-4">功能分区</th>
                    <th className="px-6 py-4">硬件设施</th>
                    <th className="px-6 py-4">实时状态</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seats.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.seatNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          s.zone === 'quiet' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          s.zone === 'discussion' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {s.zone === 'quiet' ? '安静区' : s.zone === 'discussion' ? '讨论区' : '电脑区'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {s.hasOutlet && <span title="带插座"><Power className="w-3.5 h-3.5 text-slate-400" /></span>}
                          {s.window && <span title="靠窗"><Wind className="w-3.5 h-3.5 text-slate-400" /></span>}
                          {!s.hasOutlet && !s.window && <span className="text-slate-300">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {s.status === 'available' ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 可用
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" /> 使用中
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditSeat(s)} className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteSeat(s.id)} className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-rose-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {seats.length === 0 && (
              <div className="p-12 text-center bg-slate-50/30">
                <Map className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">该楼层暂未录入座位数据，请点击上方按钮添加。</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] p-16 text-center">
          <Layout className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h4 className="text-lg font-bold text-slate-400">请先选择或创建一个楼层</h4>
        </div>
      )}

      {/* Floor modal */}
      {floorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{floorModal.mode === 'add' ? '新增楼层' : '编辑楼层信息'}</h3>
              <button onClick={() => setFloorModal(null)} className="p-2 rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">楼层序号</label>
                <input type="number" value={floorForm.number} onChange={e => setFloorForm({...floorForm, number: parseInt(e.target.value)})} className="input-modern w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">楼层显示名称</label>
                <input value={floorForm.name} onChange={e => setFloorForm({...floorForm, name: e.target.value})} className="input-modern w-full" placeholder="例：一楼社会科学区" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setFloorModal(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">取消</button>
              <button onClick={saveFloor} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">保存楼层</button>
            </div>
          </div>
        </div>
      )}

      {/* Seat modal */}
      {seatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{seatModal.mode === 'add' ? '录入新座位' : '编辑座位信息'}</h3>
              <button onClick={() => setSeatModal(null)} className="p-2 rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">座位编号</label>
                  <input value={seatForm.seatNumber} onChange={e => setSeatForm({...seatForm, seatNumber: e.target.value})} className="input-modern w-full" placeholder="例：A-001" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">所属区域</label>
                  <select value={seatForm.zone} onChange={e => setSeatForm({...seatForm, zone: e.target.value})} className="input-modern w-full">
                    <option value="quiet">安静自习区</option>
                    <option value="discussion">研讨协作区</option>
                    <option value="computer">多媒体电脑区</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${seatForm.hasOutlet ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {seatForm.hasOutlet && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={seatForm.hasOutlet} onChange={e => setSeatForm({...seatForm, hasOutlet: e.target.checked})} />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">配备电源</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${seatForm.window ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {seatForm.window && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={seatForm.window} onChange={e => setSeatForm({...seatForm, window: e.target.checked})} />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">靠窗位置</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setSeatModal(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">取消</button>
              <button onClick={saveSeat} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">保存座位</button>
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan Editor Modal */}
      {planEditorOpen && selectedFloor && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-10 animate-fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-scale-in border border-white/20 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              <FloorPlanEditor
                floor={floors.find(f => f.id === selectedFloor)!}
                seats={seats}
                onSave={async (data, updatedSeats) => {
                  await adminApi.updateFloor(selectedFloor, {
                    ...floorForm,
                    width: data.width,
                    height: data.height,
                    planAnnotations: data.planAnnotations,
                  });
                  if (updatedSeats && updatedSeats.length > 0) {
                    for (const seat of updatedSeats) {
                      await adminApi.updateSeat(seat.id, { x: seat.x, y: seat.y });
                    }
                  }
                  setPlanEditorOpen(false);
                  fetchFloors();
                }}
                onCancel={() => setPlanEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManager;