import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleRequestModal: React.FC<RoleRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const [requestedRole, setRequestedRole] = useState<'Artist' | 'EO'>('Artist');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    storage.createRoleRequest(currentUser.userId, requestedRole);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md" title="Ajukan Peningkatan Akun">
      <div className="space-y-4">
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-display font-bold text-lg text-white">Permohonan Terkirim!</h4>
            <p className="text-xs text-zinc-400">
              Admin akan meninjau kelayakan profil band / kolektifmu. Status saat ini: <strong>PENDING</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Verifikasi role diperlukan untuk memastikan keaslian band dan penyelenggara di skena independen.
              </span>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Pilih Role yang Diajukan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestedRole('Artist')}
                  className={`p-3 rounded-xl border font-bold text-xs cursor-pointer ${
                    requestedRole === 'Artist'
                      ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] ring-1 ring-[#b7ff00]'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Band / Musisi (Artist)
                </button>
                <button
                  type="button"
                  onClick={() => setRequestedRole('EO')}
                  className={`p-3 rounded-xl border font-bold text-xs cursor-pointer ${
                    requestedRole === 'EO'
                      ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] ring-1 ring-[#b7ff00]'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  Kolektif Gigs (EO)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Tautan Portofolio / Instagram Skena</label>
              <input
                type="text"
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: instagram.com/kolektif.noise atau bandcamp"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white outline-none focus:border-[#b7ff00]"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full mt-2">
              Kirim Permohonan ke Admin
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
