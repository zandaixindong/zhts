import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { XCircle, QrCode } from 'lucide-react';

interface QRDisplayProps {
  reservationId: string;
  onClose: () => void;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ reservationId, onClose }) => {
  const [timestamp] = React.useState(() => Date.now());
  const qrValue = JSON.stringify({
    type: 'seat-checkin',
    reservationId,
    timestamp,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card-modern p-6 max-w-sm w-full relative">
        <button
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 touch-target"
          onClick={onClose}
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            签到二维码
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            请出示此二维码给工作人员扫码签到，或扫描座位上的二维码完成签到
          </p>

          <div className="bg-white p-4 rounded-lg inline-block mx-auto">
            <QRCodeCanvas
              value={qrValue}
              size={200}
              level="H"
            />
          </div>

          <p className="mt-4 text-xs text-gray-500">
            预约ID: {reservationId.slice(0, 8)}...
          </p>

          <button
            className="mt-6 btn-secondary px-4 py-2 touch-target"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
