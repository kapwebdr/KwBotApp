import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import Voice from '@react-native-voice/voice';

interface AudioRecorderProps {
  onRecordingComplete: (audioData: Blob) => void;
  isDisabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isDisabled = false
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [isRecording, setIsRecording] = useState(false);

  // Refs pour Web
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceBufferRef = useRef<number[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Paramètres de détection du silence
  const SILENCE_THRESHOLD = -50; // dB
  const SILENCE_DURATION = 3000; // ms
  const MIN_RECORDING_LENGTH = 1000; // ms
  const SAMPLE_RATE = 44100;
  const BUFFER_SIZE = 4096;

  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Voice.onSpeechResults = (e: any) => {
        console.log('[AudioRecorder] Résultats de la reconnaissance vocale:', e);
        if (e.value) {
          const dummyBlob = new Blob(['dummy audio data'], { type: 'audio/wav' });
          onRecordingComplete(dummyBlob);
        }
        setIsRecording(false);
      };

      Voice.onSpeechError = (e: any) => {
        console.error('[AudioRecorder] Erreur de reconnaissance vocale:', e);
        setIsRecording(false);
      };

      Voice.onSpeechStart = () => {
        console.log('[AudioRecorder] Début de la reconnaissance vocale');
      };

      Voice.onSpeechEnd = () => {
        console.log('[AudioRecorder] Fin de la reconnaissance vocale');
      };

      return () => {
        console.log('[AudioRecorder] Nettoyage des listeners mobile');
        Voice.destroy().then(Voice.removeAllListeners);
      };
    } else {
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
      };
    }
  }, []);

  const analyzeAudio = () => {
    if (!analyserRef.current || Platform.OS !== 'web') return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatFrequencyData(dataArray);

    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = Math.pow(10, dataArray[i] / 20);
      sum += amplitude * amplitude;
      count++;
    }
    
    const rms = Math.sqrt(sum / count);
    const db = 20 * Math.log10(rms);
    const normalizedDb = Math.max(db, -100);
    
    console.log(`[AudioRecorder] Niveau sonore: ${normalizedDb.toFixed(2)} dB (seuil: ${SILENCE_THRESHOLD} dB)`);
    console.log(`[AudioRecorder] Buffer silence: ${silenceBufferRef.current.length} échantillons`);

    const isSilence = normalizedDb < SILENCE_THRESHOLD;
    const currentTime = Date.now();

    if (isSilence) {
      silenceBufferRef.current.push(currentTime);
      console.log('[AudioRecorder] Silence détecté');
      
      if (silenceBufferRef.current.length >= 3) {
        const silenceDuration = 
          silenceBufferRef.current[silenceBufferRef.current.length - 1] - 
          silenceBufferRef.current[0];

        console.log(`[AudioRecorder] Durée du silence: ${silenceDuration}ms (minimum: ${SILENCE_DURATION}ms)`);

        if (silenceDuration > SILENCE_DURATION && audioChunksRef.current.length > 0) {
          console.log('[AudioRecorder] Silence assez long détecté, envoi du segment');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          onRecordingComplete(audioBlob);
          
          // Réinitialiser uniquement le buffer audio, pas le buffer de silence
          audioChunksRef.current = [];
        }
      }
    } else {
      if (silenceBufferRef.current.length > 0) {
        console.log('[AudioRecorder] Fin du silence détecté');
      }
      silenceBufferRef.current = [];
    }

    if (isRecording) {
      requestAnimationFrame(analyzeAudio);
    }
  };

  const startRecording = async () => {
    try {
      console.log('[AudioRecorder] Démarrage de l\'enregistrement');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Voice.start('fr-FR');
        setIsRecording(true);
      } else if (Platform.OS === 'web') {
        console.log('[AudioRecorder] Configuration du micro...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: SAMPLE_RATE,
            channelCount: 1
          } 
        });
        streamRef.current = stream;

        console.log('[AudioRecorder] Configuration de l\'analyseur audio...');
        audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        analyserRef.current.fftSize = BUFFER_SIZE;
        analyserRef.current.smoothingTimeConstant = 0.2;
        sourceRef.current.connect(analyserRef.current);

        console.log('[AudioRecorder] Démarrage de l\'enregistrement...');
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log(`[AudioRecorder] Nouveau chunk audio: ${event.data.size} bytes`);
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.start(500); // Récupérer des chunks toutes les 500ms
        setIsRecording(true);
        requestAnimationFrame(analyzeAudio);

        console.log('[AudioRecorder] Démarrage du timeout de sécurité');
        recordingTimeoutRef.current = setTimeout(() => {
          console.log('[AudioRecorder] Timeout de sécurité atteint');
          stopRecording();
        }, 30000);
      }
    } catch (error) {
      console.error('[AudioRecorder] Erreur lors du démarrage:', error);
    }
  };

  const stopRecording = async () => {
    console.log('[AudioRecorder] Arrêt de l\'enregistrement');
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Voice.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('[AudioRecorder] Erreur lors de l\'arrêt mobile:', error);
      }
    } else if (Platform.OS === 'web') {
      if (!mediaRecorderRef.current || !isRecording) return;

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }

      mediaRecorderRef.current.stop();
      console.log('[AudioRecorder] MediaRecorder arrêté');
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('[AudioRecorder] Piste audio arrêtée:', track.label);
        });
      }
      setIsRecording(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.voiceButton,
        isRecording && styles.voiceButtonActive,
        isDisabled && styles.voiceButtonDisabled
      ]}
      onPress={isRecording ? stopRecording : startRecording}
      disabled={isDisabled}
    >
      <Ionicons 
        name={isRecording ? "mic" : "mic-outline"} 
        size={24}
        color={isDisabled ? theme.colors.gray400 : theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

export default AudioRecorder;