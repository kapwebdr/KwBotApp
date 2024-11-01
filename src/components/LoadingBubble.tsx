import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface LoadingBubbleProps {
  progress?: number;
  message?: string;
  status?: string;
  type?: 'model' | 'generation';
}

export const LoadingBubble: React.FC<LoadingBubbleProps> = ({ 
  progress, 
  message = 'Génération en cours',
  status,
  type = 'generation'
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const dotAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current
  ];

  useEffect(() => {
    const animations = dotAnimations.map((animation, index) => {
      return Animated.sequence([
        Animated.delay(index * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animation, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animation, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            })
          ])
        )
      ]);
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [dotAnimations]);

  const getMessage = () => {
    if (type === 'model') {
      return status || 'Chargement du modèle...';
    }
    return message;
  };

  return (
    <View style={[styles.messageBubble, styles.aiBubble]}>
      <View style={styles.loadingContent}>
        <View style={styles.loadingDots}>
          {dotAnimations.map((animation, index) => (
            <Animated.View
              key={index}
              style={[
                styles.loadingDot,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: animation,
                  transform: [{
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.messageText, styles.aiText]}>
          {getMessage()}
        </Text>
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, styles.aiText]}>
              {`${Math.round(progress)}%`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}; 