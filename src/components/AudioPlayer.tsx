import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Sound from 'react-native-sound';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  autoPlay = false,
  onEnd,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | Sound | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Configuration pour le Web
      audioRef.current = new Audio(audioUrl);
      if (autoPlay) {
        audioRef.current.play().catch(onError);
      }
      
      if (audioRef.current) {
        audioRef.current.onended = () => {
          setIsPlaying(false);
          onEnd?.();
        };
        audioRef.current.onerror = (error) => {
          onError?.(error);
        };
      }
    } else {
      // Configuration pour React Native
      Sound.setCategory('Playback');
      audioRef.current = new Sound(audioUrl, '', (error) => {
        if (error) {
          onError?.(error);
          return;
        }
        if (autoPlay) {
          play();
        }
      });
    }

    return () => {
      if (Platform.OS === 'web') {
        if (audioRef.current instanceof HTMLAudioElement) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } else {
        if (audioRef.current instanceof Sound) {
          audioRef.current.release();
        }
      }
    };
  }, [audioUrl]);

  const play = () => {
    if (Platform.OS === 'web') {
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.play().catch(onError);
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current instanceof Sound) {
        audioRef.current.play((success) => {
          if (!success) {
            onError?.(new Error('Playback failed'));
          }
          setIsPlaying(false);
          onEnd?.();
        });
        setIsPlaying(true);
      }
    }
  };

  const pause = () => {
    if (Platform.OS === 'web') {
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current instanceof Sound) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const stop = () => {
    if (Platform.OS === 'web') {
      if (audioRef.current instanceof HTMLAudioElement) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current instanceof Sound) {
        audioRef.current.stop();
        setIsPlaying(false);
      }
    }
  };

  return (
    <View>
      {Platform.OS === 'web' ? (
        <audio
          controls
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            onEnd?.();
          }}
          onError={onError}
          style={{ width: '100%' }}
        />
      ) : (
        <View>
          {/* Ici vous pouvez ajouter vos propres contrôles personnalisés pour React Native */}
        </View>
      )}
    </View>
  );
}; 