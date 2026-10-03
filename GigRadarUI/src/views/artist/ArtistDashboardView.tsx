import React, { useState } from 'react';
import { Users, Music, Disc, Newspaper, Plus, PlusCircle, CheckCircle2, Play, Calendar } from 'lucide-react';
import { Artist, AudioTrack, ArtistAlbum, ArtistPost, ArtistMember, ArtistJourneyItem, Event } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AudioPlayer } from '../../components/artist/AudioPlayer';
import { Modal } from '../../components/ui/Modal';
import { storage } from '../../services/storage';

export interface ArtistDashboardViewProps {
  artist: Artist;
  events: Event[];
  onUpdateArtist: (artist: Artist) => void;
  onSelectEvent: (event: Event) => void;
}

export const ArtistDashboardView: React.FC<ArtistDashboardViewProps> = ({
  artist,
  events,
  onUpdateArtist,
  onSelectEvent,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tracks' | 'albums' | 'posts' | 'journey' | 'members'>('overview');

  // Track upload modal
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState(artist.genre || 'Shoegaze');

  // Post modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  const artistEvents = events.filter((e) =>
    e.artists?.some((a) => a.artistId === artist.artistId)
  );

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const newTrack: AudioTrack = {
      trackId: Date.now(),
      artistId: artist.artistId,
      title: newTrackTitle,
      audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
      coverUrl: artist.coverUrl || artist.photoUrl,
      genre: newTrackGenre,
      durationSeconds: 30,
      releaseDate: new Date().toISOString().split('T')[0],
    };

    const updatedArtist = {
      ...artist,
      tracks: [newTrack, ...(artist.tracks || [])],
    };

    storage.saveArtist(updatedArtist);
    onUpdateArtist(updatedArtist);
    setNewTrackTitle('');
    setIsTrackModalOpen(false);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: ArtistPost = {
      postId: Date.now(),
      artistId: artist.artistId,
      title: postTitle,
      content: postContent,
      imageUrl: artist.coverUrl || '',
      isPublished: true,
      createdAt: new Date().toISOString(),
    };

    const updatedArtist = {
      ...artist,
      posts: [newPost, ...(artist.posts || [])],
    };

    storage.saveArtist(updatedArtist);
    onUpdateArtist(updatedArtist);
    setPostTitle('');
    setPostContent('');
    setIsPostModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Hero Artist Banner */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={artist.photoUrl}
            alt={artist.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#b7ff00] shadow-lg"
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#b7ff00] font-bold">
                Artist Hub Workspace
              </span>
              <Badge variant="lime" size="sm">Verified Band</Badge>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-0.5">
              {artist.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{artist.genre} • {artist.city}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTrackModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Upload Trek Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
            icon={<Newspaper className="w-3.5 h-3.5" />}
          >
            Buat Kabar Band
          </Button>
        </div>
      </div>

      {/* Metric KPI Cards (Section 36) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Total Pengikut</span>
          <p className="font-display font-black text-2xl text-[#b7ff00] mt-1">
            {artist.followersCount.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">+12% bulan ini</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Gigs Mendatang</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            {artistEvents.length}
          </p>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Jadwal aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Trek Terunggah</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            {artist.tracks?.length || 0}
          </p>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">30s audio preview</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Album Rilis</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            {artist.albums?.length || 0}
          </p>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Fisik & Digital</span>
        </div>
      </div>

      {/* Subtabs: Overview, Tracks, Albums, Posts, Journey, Members */}
      <div className="flex gap-2 border-b border-[#27272a] pb-2 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Ringkasan Lineup' },
          { id: 'tracks', label: `Trek Audio (${artist.tracks?.length || 0})` },
          { id: 'albums', label: `Album (${artist.albums?.length || 0})` },
          { id: 'posts', label: `Kabar Band (${artist.posts?.length || 0})` },
          { id: 'journey', label: 'Timeline Perjalanan' },
          { id: 'members', label: `Personil (${artist.members?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-[#18181b] text-[#b7ff00] font-bold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-base text-white">Gigs yang Mengikutsertakan {artist.name}</h3>
          {artistEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {artistEvents.map((evt) => (
                <div
                  key={evt.eventId}
                  onClick={() => onSelectEvent(evt)}
                  className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] hover:border-zinc-600 transition-colors flex gap-3.5 items-center cursor-pointer"
                >
                  <img src={evt.posterUrl} alt={evt.name} className="w-16 h-20 rounded-xl object-cover bg-zinc-800 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#b7ff00] font-bold">{evt.genre?.name}</span>
                    <h4 className="font-display font-bold text-sm text-white truncate">{evt.name}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{evt.venue?.name}</p>
                    <span className="text-xs font-mono text-zinc-400 block mt-1">
                      {new Date(evt.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-8 text-center bg-[#111113] rounded-2xl border border-[#27272a]">
              Belum ada event yang menambahkan {artist.name} ke dalam lineup.
            </p>
          )}
        </div>
      )}

      {/* TAB: TRACKS */}
      {activeSubTab === 'tracks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Daftar Audio Preview (30 Detik)</h3>
            <Button variant="primary" size="sm" onClick={() => setIsTrackModalOpen(true)}>
              + Tambah Lagu Baru
            </Button>
          </div>
          {artist.tracks && artist.tracks.length > 0 ? (
            artist.tracks.map((t) => <AudioPlayer key={t.trackId} track={t} />)
          ) : (
            <p className="text-xs text-zinc-500 py-8 text-center bg-[#111113] rounded-2xl border border-[#27272a]">
              Belum ada trek audio yang diunggah.
            </p>
          )}
        </div>
      )}

      {/* TAB: ALBUMS */}
      {activeSubTab === 'albums' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artist.albums?.map((a) => (
            <div key={a.albumId} className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] flex gap-4">
              <img src={a.coverUrl} alt={a.title} className="w-20 h-20 rounded-xl object-cover bg-zinc-800 shrink-0" />
              <div>
                <h4 className="font-bold text-base text-white">{a.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">{a.description}</p>
                <span className="text-xs font-mono text-[#b7ff00] block mt-2">Rilis: {a.releaseDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: POSTS */}
      {activeSubTab === 'posts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Kabar & Update Komunitas Band</h3>
            <Button variant="primary" size="sm" onClick={() => setIsPostModalOpen(true)}>
              + Buat Kabar Baru
            </Button>
          </div>
          {artist.posts?.map((p) => (
            <div key={p.postId} className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] space-y-2">
              <span className="text-[10px] font-mono text-zinc-500">{new Date(p.createdAt).toLocaleDateString('id-ID')}</span>
              <h4 className="font-bold text-sm text-white">{p.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{p.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: JOURNEY */}
      {activeSubTab === 'journey' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] relative pl-8 space-y-6 before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-800">
          {artist.journey?.map((item) => (
            <div key={item.journeyId} className="relative">
              <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#b7ff00] ring-4 ring-[#111113]" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.date} • {item.category}</span>
              <h5 className="font-bold text-sm text-white mt-0.5">{item.title}</h5>
              <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: MEMBERS */}
      {activeSubTab === 'members' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {artist.members?.map((m) => (
            <div key={m.memberId} className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] text-center">
              <img src={m.photoUrl} alt={m.name} className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-zinc-700 mb-2" />
              <p className="font-bold text-sm text-white">{m.name}</p>
              <p className="text-xs text-zinc-400">{m.role}</p>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1">Bergabung: {m.joinedAt}</span>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD TRACK */}
      <Modal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} title="Unggah Trek Audio Preview">
        <form onSubmit={handleAddTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Judul Lagu</label>
            <input
              type="text"
              required
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
              placeholder="Contoh: Distorsi Fajar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-sm text-white outline-none focus:border-[#b7ff00]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Genre</label>
            <input
              type="text"
              value={newTrackGenre}
              onChange={(e) => setNewTrackGenre(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-sm text-white outline-none focus:border-[#b7ff00]"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            Preview otomatis dipangkas menjadi 30 detik untuk kenyamanan audiens skena.
          </p>
          <Button type="submit" variant="primary" size="md" className="w-full">
            Simpan Trek Audio
          </Button>
        </form>
      </Modal>

      {/* MODAL: CREATE POST */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="Buat Kabar / Pengumuman Band">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Judul Kabar</label>
            <input
              type="text"
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Contoh: Soundcheck Showcase Akhir Pekan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-sm text-white outline-none focus:border-[#b7ff00]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Isi Kabar</label>
            <textarea
              required
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Tuliskan kabar, pengumuman rilis, atau ucapan terima kasih untuk kawan skena..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-sm text-white outline-none focus:border-[#b7ff00]"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="w-full">
            Publikasikan Kabar
          </Button>
        </form>
      </Modal>
    </div>
  );
};
