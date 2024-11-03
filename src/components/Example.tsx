import React from 'react';
import { View } from 'react-native';
import { AudioPlayer } from './AudioPlayer';

export const Example: React.FC = () => {
  return (
    <View>
      <AudioPlayer
        audioUrl="https://example.com/audio.mp3"
        autoPlay={false}
        onEnd={() => console.log('Audio finished')}
        onError={(error) => console.error('Audio error:', error)}
      />
    </View>
  );
}; 