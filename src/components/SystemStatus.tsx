import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { SystemMetrics } from '../types';
import { apiHandler } from '../services/apiHandler';

export const SystemStatus: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const result = await apiHandler.executeApiAction(
          'system_metrics',
          'execute',
          {}
        );
        setMetrics(result);
        setStatus('connected');
      } catch (error) {
        console.error('Erreur lors de la récupération des métriques:', error);
        setStatus('error');
      }
    };

    // Première récupération
    fetchMetrics();

    // Rafraîchissement toutes les 10 secondes
    const interval = setInterval(fetchMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

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