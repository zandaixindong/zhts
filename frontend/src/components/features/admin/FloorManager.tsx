import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { adminApi } from '../../../utils/api';
import type { Floor, Seat } from '../../../types';

const FloorManager: React.FC = () => {
  const [floors, setFloors] = useState<(Floor & { seats: Seat[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<(Floor & { seats: Seat[] }) | null>(null);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [_selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [floorFormData, setFloorFormData] = useState({
    number: 1,
    name: '',
  });
  const [seatFormData, setSeatFormData] = useState({
    floorId: '',
    seatNumber: '',
    x: 0,
    y: 0,
    hasOutlet: false,
    window: false,
    zone: 'standard',
    status: 'available',
  });

  const loadFloors = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFloors();
      setFloors(data);
    } catch (e) {
      console.error('Failed to load floors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloors();
  }, []);

  const handleSubmitFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        await adminApi.updateFloor(editingFloor.id, floorFormData);
      } else {
        await adminApi.createFloor(floorFormData);
      }
      setShowFloorModal(false);
      setEditingFloor(null);
      setFloorFormData({ number: 1, name: '' });
      loadFloors();
    } catch (e) {
      console.error('Failed to save floor:', e);
      alert('保存失败');
    }
  };

  const handleEditFloor = (floor: Floor & { seats: Seat[] }) => {
    setEditingFloor(floor);
    setFloorFormData({
      number: floor.number,
      name: floor.name,
    });
    setShowFloorModal(true);
  };

  const handleDeleteFloor = async (id: string) => {
    if (!confirm('确定要删除这个楼层吗？这会删除该楼层的所有座位！')) return;
    try {
      await adminApi.deleteFloor(id);
      loadFloors();
    } catch (e) {
      console.error('Failed to delete floor:', e);
      alert('删除失败');
    }
  };

  const openAddSeat = (floorId: string) => {
    setSelectedFloorId(floorId);
    setEditingSeat(null);
    setSeatFormData({
      floorId: floorId,
      seatNumber: '',
      x: 0,
      y: 0,
      hasOutlet: false,
      window: false,
      zone: 'standard',
      status: 'available',
    });
    setShowSeatModal(true);
  };

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat);
    setSeatFormData({ ...seat });
    setShowSeatModal(true);
  };

  const handleDeleteSeat = async (_floorId: string, seatId: string) => {
    if (!confirm('确定要删除这个座位吗？')) return;
    try {
      await adminApi.deleteSeat(seatId);
      loadFloors();
    } catch (e) {
      console.error('Failed to delete seat:', e);
      alert('删除失败');
    }
  };

  const handleSubmitSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeat) {
        await adminApi.updateSeat(editingSeat.id, seatFormData);
      } else {
        await adminApi.createSeat(seatFormData);
      }
      setShowSeatModal(false);
      setEditingSeat(null);
      loadFloors();
    } catch (e) {
      console.error('Failed to save seat:', e);
      alert('保存失败');
    }
  };

  const getZoneName = (zone: string) => {
    switch (zone) {
      case 'quiet': return '安静区';
      case 'group': return '小组学习';
      default: return '普通区';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'available'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">楼层座位管理</h3>
        <button
          onClick={() => {
            setEditingFloor(null);
            setFloorFormData({ number: 1, name: '' });
            setShowFloorModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          添加楼层
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-6">
          {floors.map((floor) => (
            <div key={floor.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{floor.name}</h4>
                  <p className="text-sm text-gray-500">{floor.seats.length} 个座位</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openAddSeat(floor.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    添加座位
                  </button>
                  <button
                    onClick={() => handleEditFloor(floor)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFloor(floor.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {floor.seats.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">座位号</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">坐标</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">区域</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">特性</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">状态</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {floor.seats.map((seat) => (
                        <tr key={seat.id}>
                          <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                            {seat.seatNumber}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                            {seat.x}, {seat.y}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                            {getZoneName(seat.zone)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                            <div className="flex gap-1">
                              {seat.hasOutlet && <span className="text-xs bg-blue-100 px-2 rounded">电源</span>}
                              {seat.window && <span className="text-xs bg-blue-100 px-2 rounded">靠窗</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass(seat.status)}`}>
                              {seat.status === 'available' ? '空闲' : '占用'}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditSeat(seat)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSeat(floor.id, seat.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {editingFloor ? '编辑楼层' : '添加楼层'}
            </h3>
            <form onSubmit={handleSubmitFloor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">楼层号</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={floorFormData.number}
                  onChange={(e) => setFloorFormData({ ...floorFormData, number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">楼层名称</label>
                <input
                  type="text"
                  required
                  value={floorFormData.name}
                  onChange={(e) => setFloorFormData({ ...floorFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="一楼 - 安静阅读区"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFloorModal(false);
                    setEditingFloor(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingFloor ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {editingSeat ? '编辑座位' : '添加座位'}
            </h3>
            <form onSubmit={handleSubmitSeat} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">座位编号</label>
                  <input
                    type="text"
                    required
                    value={seatFormData.seatNumber}
                    onChange={(e) => setSeatFormData({ ...seatFormData, seatNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1-1-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">区域</label>
                  <select
                    value={seatFormData.zone}
                    onChange={(e) => setSeatFormData({ ...seatFormData, zone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="quiet">安静区</option>
                    <option value="group">小组学习</option>
                    <option value="standard">普通区</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">X 坐标 (0-100)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={seatFormData.x}
                    onChange={(e) => setSeatFormData({ ...seatFormData, x: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y 坐标 (0-100)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={seatFormData.y}
                    onChange={(e) => setSeatFormData({ ...seatFormData, y: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seatFormData.hasOutlet}
                    onChange={(e) => setSeatFormData({ ...seatFormData, hasOutlet: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">配有电源插座</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seatFormData.window}
                    onChange={(e) => setSeatFormData({ ...seatFormData, window: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">靠窗座位</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={seatFormData.status}
                  onChange={(e) => setSeatFormData({ ...seatFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="available">空闲</option>
                  <option value="occupied">占用</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSeatModal(false);
                    setEditingSeat(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSeat ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManager;
