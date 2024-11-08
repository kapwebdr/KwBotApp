import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { SystemMetrics, Container } from '../types/systemMetrics';
import { apiHandler } from '../services/apiHandler';
import { createStyles } from '../styles/theme.styles';

export const Monitoring: React.FC = () => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [systemStats, setSystemStats] = useState<SystemMetrics | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [showContainers, setShowContainers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const styles = createStyles({ theme });
  const fetchData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      const [statsResponse, containersResponse] = await Promise.all([
        apiHandler.executeApiAction('monitoring', 'systemStats'),
        apiHandler.executeApiAction('monitoring', 'containersList')
      ]);

      setSystemStats(statsResponse);
      setContainers(containersResponse);
      setError(null);
    } catch (err) {
      setError('Erreur données');
      console.error('Erreur lors de la récupération des données:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1200000);
    return () => clearInterval(interval);
  }, []);

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    const container = containers.find(c => c.id === containerId);
    const containerName = container ? formatContainerName(container.name) : containerId;
    
    try {
      addNotification('info', `${action.charAt(0).toUpperCase() + action.slice(1)} en cours pour ${containerName}...`);
      
      await apiHandler.executeApiAction('monitoring', 'execute', {
        containerId,
        action,
      });
      
      await new Promise(resolve => setTimeout(resolve, 20000));
      addNotification('success', `${containerName} a été ${action === 'start' ? 'démarré' : action === 'stop' ? 'arrêté' : 'redémarré'} avec succès`);
    } catch (err) {
      setError(`Erreur ${action}`);
      addNotification('error', `Échec de l'action ${action} sur ${containerName}`);
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatContainerName = (name: string): string => {
    return name.startsWith('brenda_') ? name.substring(7) : name;
  };

  return (
    <View style={styles.monitoringContainer}>
      {/* Stats système */}
      <TouchableOpacity 
        style={[styles.monitoringStatsContainer, { backgroundColor: theme.colors.gray100 }]}
        onPress={() => setShowContainers(!showContainers)}
      >
        <Ionicons 
          name="analytics" 
          size={16} 
          color={error ? '#FF0000' : '#00FF9C'} 
          style={styles.monitoringIcon}
        />
        {systemStats && (
          <Text style={[styles.monitoringStatsText, { color: theme.colors.text }]}>
            CPU: {systemStats && systemStats.cpu && systemStats.cpu.percent ? systemStats.cpu.percent.toFixed(1) : '0'}% | 
            RAM: {systemStats && systemStats.memory && systemStats.memory.percent ? systemStats.memory.percent.toFixed(1) : '0'}% | 
            Disk: {systemStats && systemStats.disk && systemStats.disk.percent ? systemStats.disk.percent.toFixed(1) : '0'}%
          </Text>
        )}
        <Ionicons 
          name={showContainers ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={theme.colors.text}
        />
      </TouchableOpacity>

      {/* Liste des conteneurs */}
      {showContainers && (
        <View style={[styles.monitoringContainersDropdown, { backgroundColor: theme.colors.gray100 }]}>
          {containers && containers.map((container) => (
            <View key={container.id} style={styles.monitoringContainerItem}>
              <View style={styles.monitoringContainerHeader}>
                <View style={styles.monitoringContainerInfo}>
                  <View style={[
                    styles.monitoringStatusDot,
                    { backgroundColor: container.status === 'running' ? '#4CAF50' : '#F44336' }
                  ]} />
                  <Text style={[styles.monitoringContainerName, { color: theme.colors.text }]}>
                    {formatContainerName(container.name)}
                  </Text>
                </View>
                <Text style={[styles.monitoringStatsText, { color: theme.colors.text }]}>
                  {container && container.stats && container.stats.cpu_percent && container.stats.cpu_percent.toFixed(1)}% | 
                  {container && container.stats && container.stats.memory_usage && formatBytes(container.stats.memory_usage)}
                </Text>
                <View style={styles.monitoringActions}>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'start')}
                    style={styles.monitoringActionButton}
                  >
                    <Ionicons name="play" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'stop')}
                    style={styles.monitoringActionButton}
                  >
                    <Ionicons name="stop" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'restart')}
                    style={styles.monitoringActionButton}
                  >
                    <Ionicons name="refresh" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
