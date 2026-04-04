import React, { useState } from 'react';
import { Book, MapPin } from 'lucide-react';
import MyBorrowing from './MyBorrowing';
import MyReservations from './MyReservations';
import QRDisplay from '../qr-checkin/QRDisplay';
import AIPersonaCard from './AIPersonaCard';

const MyActivity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrowing' | 'reservations'>('borrowing');
  const [showQRModal, setShowQRModal] = useState<string | null>(null);

  const handleShowQR = (reservationId: string) => {
    setShowQRModal(reservationId);
  };

  const closeQR = () => {
    setShowQRModal(null);
  };

  return (
    <div className="space-y-4">
      <AIPersonaCard />

      <div className="card-modern p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Book className="w-6 h-6 text-blue-600" />
          我的活动
        </h2>
        <p className="text-gray-600 mb-4">查看当前借阅和座位预约</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors touch-target ${
              activeTab === 'borrowing'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('borrowing')}
          >
            <Book className="w-4 h-4 inline mr-1" />
            我的借阅
          </button>
          <button
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors touch-target ${
              activeTab === 'reservations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reservations')}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            座位预约
          </button>
        </div>

        {activeTab === 'borrowing' ? <MyBorrowing /> : <MyReservations onShowQR={handleShowQR} />}
      </div>

      {showQRModal && (
        <QRDisplay reservationId={showQRModal} onClose={closeQR} />
      )}
    </div>
  );
};

export default MyActivity;
