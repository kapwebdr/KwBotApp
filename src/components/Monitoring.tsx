import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { SystemMetrics, Container } from '../types/systemMetrics';
import { apiHandler } from '../services/apiHandler';

export const Monitoring: React.FC = () => {
  const { theme } = useTheme();
  const [systemStats, setSystemStats] = useState<SystemMetrics | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [showContainers, setShowContainers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = async () => {
    if (isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      const [statsResponse, containersResponse] = await Promise.all([
        apiHandler.executeApiAction('monitoring', 'systemStats', null, 'handleSystemStats'),
        apiHandler.executeApiAction('monitoring', 'containersList', null, 'handleContainersList')
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
    const interval = setInterval(() => {
      fetchData();
    }, 1200000);
    return () => clearInterval(interval);
  }, []);

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await apiHandler.executeApiAction('monitoring', 'execute', {
        containerId,
        action,
      }, 'handleContainerAction');
      await new Promise(resolve => setTimeout(resolve, 20000));
    } catch (err) {
      setError(`Erreur ${action}`);
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
    <View style={styles.container}>
      {/* Stats système */}
      <TouchableOpacity 
        style={[styles.statsContainer, { backgroundColor: theme.colors.gray100 }]}
        onPress={() => setShowContainers(!showContainers)}
      >
        <Ionicons 
          name="analytics" 
          size={16} 
          color={error ? '#FF0000' : '#00FF9C'} 
          style={styles.icon}
        />
        {systemStats && (
          <Text style={[styles.statsText, { color: theme.colors.text }]}>
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
        <View style={[styles.containersDropdown, { backgroundColor: theme.colors.gray100 }]}>
          {containers && containers.map((container) => (
            <View key={container.id} style={styles.containerItem}>
              <View style={styles.containerHeader}>
                <View style={styles.containerInfo}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: container.status === 'running' ? '#4CAF50' : '#F44336' }
                  ]} />
                  <Text style={[styles.containerName, { color: theme.colors.text }]}>
                    {formatContainerName(container.name)}
                  </Text>
                </View>
                <Text style={[styles.statsText, { color: theme.colors.text }]}>
                  {container && container.stats && container.stats.cpu_percent && container.stats.cpu_percent.toFixed(1)}% | 
                  {container && container.stats && container.stats.memory_usage && formatBytes(container.stats.memory_usage)}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'start')}
                    style={styles.actionButton}
                  >
                    <Ionicons name="play" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'stop')}
                    style={styles.actionButton}
                  >
                    <Ionicons name="stop" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleContainerAction(container.id, 'restart')}
                    style={styles.actionButton}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    marginHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  containersDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 4,
    padding: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  containerItem: {
    marginVertical: 2,
  },
  containerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  containerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  containerName: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
