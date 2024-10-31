import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { SystemMetrics } from '../services/websocket';

interface SystemStatusProps {
  status: 'connected' | 'disconnected' | 'error';
  metrics: SystemMetrics | null;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status, metrics }) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#00FF9C';
      case 'disconnected': return '#FFA500';
      case 'error': return '#FF0000';
      default: return theme.colors.text;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return 'checkmark-circle';
      case 'disconnected': return 'warning';
      case 'error': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.systemStatus}>
      <Ionicons
        name={getStatusIcon()}
        size={16}
        color={getStatusColor()}
        style={styles.statusIcon}
      />
      {metrics && status === 'connected' && (
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {`CPU: ${metrics.cpu.percent.toFixed(0)}% | RAM: ${metrics.memory.percent.toFixed(0)}%`}
          {metrics.gpu.length > 0 && ` | GPU: ${metrics.gpu[0].load.toFixed(0)}%`}
        </Text>
      )}
    </View>
  );
}; 