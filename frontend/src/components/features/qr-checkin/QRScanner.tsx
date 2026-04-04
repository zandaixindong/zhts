import React, { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { Camera, XCircle, CheckCircle } from 'lucide-react';
import { checkInReservation } from '../../../utils/api';
import { useStore } from '../../../store/useStore';

interface QRScannerProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const currentUser = useStore(state => state.currentUser);

  const handleResult = async (result: Result) => {
    if (!codeReader.current || !currentUser) return;

    try {
      // Parse QR code content
      const content = JSON.parse(result.getText());

      if (content.type === 'seat-checkin' && content.reservationId) {
        stopScanning();

        const response = await checkInReservation(content.reservationId, currentUser.id);

        if (response.success) {
          setSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else {
          setError(response.message || '签到失败');
          startScanning();
        }
      } else {
        setError('无效的二维码，请扫描正确的签到二维码');
      }
    } catch (e) {
      console.error('QR parse error:', e);
      setError('无法解析二维码，请重试');
    }
  };

  const startScanning = async () => {
    if (!codeReader.current) return;

    try {
      setScanning(true);
      setError(null);
      setSuccess(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      codeReader.current.decodeFromVideoDevice(null, videoRef.current!,
        async (result: Result | null, err: any) => {
          if (result) {
            await handleResult(result);
          }
          if (err && !(err instanceof Error)) {
            console.error(err);
          }
        }
      );
    } catch (e) {
      console.error('Failed to start camera:', e);
      setError('无法访问相机，请确保已授予相机权限。');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card-modern p-4 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 touch-target z-10"
          onClick={() => {
            stopScanning();
            onCancel();
          }}
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          扫描座位二维码签到
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-800 font-medium">签到成功！</p>
          </div>
        )}

        {!success && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/50 animate-pulse" />
            </div>
          </div>
        )}

        {!scanning && !success && !error && (
          <div className="text-center py-4">
            <button
              className="btn-primary px-6 py-3 touch-target inline-flex items-center gap-2"
              onClick={startScanning}
            >
              <Camera className="w-5 h-5" />
              开始扫描
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
