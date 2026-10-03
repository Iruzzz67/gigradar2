import React, { useState } from 'react';
import { ScanLine, CheckCircle2, AlertTriangle, XCircle, Search, Camera, QrCode } from 'lucide-react';
import { TicketScanResult } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { nativeBridge } from '../../services/bridge';

export interface GateValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GateValidatorModal: React.FC<GateValidatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const handleValidate = async (codeToValidate?: string) => {
    const code = codeToValidate || ticketInput;
    if (!code.trim()) return;

    setIsLoading(true);
    setScanResult(null);

    try {
      const res = await api.validateTicket(code);

      if (res.status === 'valid') {
        nativeBridge.hapticFeedback('success');
      } else if (res.status === 'used') {
        nativeBridge.hapticFeedback('medium');
      } else {
        nativeBridge.hapticFeedback('error');
      }

      setScanResult({
        status: res.status,
        ticket: res.ticket,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } catch {
      setScanResult({
        status: 'invalid',
        message: 'Gagal menghubungi server validasi gate.',
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateQuickScan = (code: string) => {
    setTicketInput(code);
    handleValidate(code);
  };

  const handleClose = () => {
    setScanResult(null);
    setTicketInput('');
    setCameraActive(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md" title="Gate Ticket Validator" subtitle="Pemindaian Tiket Masuk Venue">
      <div className="space-y-5">
        {/* Scanner Surface */}
        <div className="relative rounded-2xl bg-[#09090b] border border-[#27272a] overflow-hidden p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 border-2 border-dashed border-[#b7ff00]/60 rounded-2xl flex items-center justify-center bg-zinc-950/80 mb-4 overflow-hidden shadow-[0_0_30px_rgba(183,255,0,0.15)]">
            <ScanLine className="w-16 h-16 text-[#b7ff00] animate-pulse" />
            
            {/* Animated Laser Scanning Line */}
            <div className="absolute left-0 right-0 h-1 bg-[#b7ff00] shadow-[0_0_15px_#b7ff00] animate-[bounce_2s_infinite]" />

            <div className="absolute bottom-2 text-[10px] font-mono uppercase tracking-widest text-[#b7ff00]">
              Sensor Aktif
            </div>
          </div>

          <p className="text-xs text-zinc-400 max-w-xs">
            Arahkan kamera ke QR tiket pengunjung atau masukkan kode tiket secara manual di bawah ini.
          </p>

          {/* Quick Demo Scan Buttons for Testing */}
          <div className="mt-4 pt-4 border-t border-zinc-800 w-full flex flex-wrap gap-2 justify-center">
            <span className="text-[11px] font-mono text-zinc-500 w-full">Tes Pemindaian Cepat:</span>
            <button
              onClick={() => handleSimulateQuickScan('GR-TKT-98234-ACTIVE')}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono cursor-pointer"
            >
              Test Valid Ticket
            </button>
            <button
              onClick={() => handleSimulateQuickScan('GR-INVALID-999')}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono cursor-pointer"
            >
              Test Invalid
            </button>
          </div>
        </div>

        {/* Manual Code Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Contoh: GR-TKT-98234-ACTIVE atau #101"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white font-mono uppercase outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
            <QrCode className="absolute right-3 top-3 w-4 h-4 text-zinc-500" />
          </div>
          <Button
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={() => handleValidate()}
            icon={<Search className="w-4 h-4" />}
          >
            Verifikasi
          </Button>
        </div>

        {/* HIGH-VISIBILITY GATE RESULT DISPLAY (Section 30) */}
        {scanResult && (
          <div
            className={`p-5 rounded-2xl border transition-all animate-in zoom-in-95 duration-200 text-left ${
              scanResult.status === 'valid'
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                : scanResult.status === 'used'
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                : 'bg-red-950/80 border-red-500/80 text-red-200 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.status === 'valid' && (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
              )}
              {scanResult.status === 'used' && (
                <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
              )}
              {scanResult.status === 'invalid' && (
                <XCircle className="w-10 h-10 text-red-400 shrink-0" />
              )}

              <div>
                <h4 className="font-display font-black text-xl tracking-wide uppercase">
                  {scanResult.status === 'valid' && 'VALID TICKET — IZINKAN MASUK'}
                  {scanResult.status === 'used' && 'TICKET ALREADY USED'}
                  {scanResult.status === 'invalid' && 'INVALID TICKET / TIDAK DITEMUKAN'}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">{scanResult.message}</p>
              </div>
            </div>

            {scanResult.ticket && (
              <div className="mt-4 pt-3 border-t border-current/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-75 block text-[10px] uppercase font-mono">Nama Pengunjung</span>
                  <span className="font-bold text-white text-sm">{scanResult.ticket.buyerName}</span>
                </div>
                <div>
                  <span className="opacity-75 block text-[10px] uppercase font-mono">Tipe Tiket</span>
                  <span className="font-bold text-white text-sm">{scanResult.ticket.ticketType}</span>
                </div>
                <div>
                  <span className="opacity-75 block text-[10px] uppercase font-mono">Acara</span>
                  <span className="font-medium text-white truncate">{scanResult.ticket.event?.name}</span>
                </div>
                <div>
                  <span className="opacity-75 block text-[10px] uppercase font-mono">Status Terkini</span>
                  <span className="font-mono font-bold uppercase">{scanResult.ticket.status}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
