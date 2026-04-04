import React, { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader, Result, Exception } from '@zxing/library';
import { Camera, Scan, Search, XCircle } from 'lucide-react';
import { booksApi } from '../../../utils/api';
import BookCard from '../book-search/BookCard';
import type { Book } from '../../../types';

const BarcodeScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!codeReader.current) return;

    try {
      setScanning(true);
      setError(null);
      setResult(null);
      setBook(null);
      setNotFound(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      codeReader.current.decodeFromVideoDevice(null, videoRef.current!,
        (result: Result | null, err: any) => {
          if (result) {
            handleResult(result);
          }
          if (err && !(err instanceof Exception)) {
            console.error(err);
          }
        }
      );
    } catch (e) {
      const errorName = e instanceof DOMException ? e.name : '';
      if (errorName === 'NotFoundError') {
        setError('未检测到可用摄像头，你可以直接在下方手动输入 ISBN 进行搜索。');
      } else if (errorName === 'NotAllowedError') {
        setError('无法访问相机，请检查浏览器相机权限，或改用手动 ISBN 搜索。');
      } else {
        console.error('Failed to start camera:', e);
        setError('无法访问相机，请确保已授予相机权限。');
      }
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

  const handleResult = async (result: Result) => {
    if (!codeReader.current) return;

    codeReader.current.reset();
    stopScanning();
    setResult(result);

    const isbn = result.getText();
    setLoading(true);
    setNotFound(false);

    try {
      const foundBook = await booksApi.searchByIsbn(isbn);
      if (foundBook) {
        setBook(foundBook);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.error('Search error:', e);
      setError('搜索失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setBook(null);
    setNotFound(false);
    setError(null);
    setManualIsbn('');
    startScanning();
  };

  const handleManualSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualIsbn.trim()) {
      setError('请输入 ISBN');
      return;
    }

    setLoading(true);
    setError(null);
    setBook(null);
    setNotFound(false);
    setResult(null);

    try {
      const foundBook = await booksApi.searchByIsbn(manualIsbn.trim());
      if (foundBook) {
        setBook(foundBook);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.error('Manual search error:', e);
      setError('搜索失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card-modern p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Scan className="w-6 h-6 text-blue-600" />
          条形码扫码找书
        </h2>
        <p className="text-gray-600 mb-4">
          将书籍背面的ISBN条形码对准相机，自动扫描搜索馆藏。
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!scanning && !result && (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">点击下方按钮开始扫码</p>
            <button
              className="btn-primary px-6 py-3 touch-target inline-flex items-center gap-2"
              onClick={startScanning}
            >
              <Camera className="w-5 h-5" />
              开始扫码
            </button>

            <form onSubmit={handleManualSearch} className="mx-auto mt-6 max-w-md space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                  placeholder="没有摄像头时可直接输入 ISBN"
                  className="input-modern h-11 pl-10"
                />
              </div>
              <button type="submit" className="btn-secondary px-4 py-2 touch-target inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                手动搜索 ISBN
              </button>
            </form>
          </div>
        )}

        {scanning && (
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
            <button
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full touch-target"
              onClick={stopScanning}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-600">正在搜索...</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="mt-4 p-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">未找到这本书</p>
            <p className="text-yellow-700 text-sm mt-1">馆藏中没有ISBN为 {result?.getText() || manualIsbn} 的书籍</p>
            <button
              className="mt-4 btn-secondary px-4 py-2 touch-target"
              onClick={resetScan}
            >
              重新扫码
            </button>
          </div>
        )}

        {book && !loading && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">搜索结果</h3>
            <BookCard book={book} />
            <div className="mt-4 text-center">
              <button
                className="btn-secondary px-4 py-2 touch-target inline-flex items-center gap-2"
                onClick={resetScan}
              >
                <Scan className="w-4 h-4" />
                继续扫码
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
