import { useState, useEffect } from 'react';
import { audioService, AudioPlayerState } from '../services/audioService';
import { AudioTrack, Artist } from '../types';

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    play: (track: AudioTrack, artist: Artist, isAutoPlay = false) => audioService.play(track, artist, isAutoPlay),
    togglePlay: () => audioService.togglePlay(),
    pause: () => audioService.pause(),
    resume: () => audioService.resume(),
    stop: () => audioService.stop(),
    seek: (percent: number) => audioService.seek(percent),
    setVolume: (vol: number) => audioService.setVolume(vol),
    toggleMute: () => audioService.toggleMute(),
  };
};
