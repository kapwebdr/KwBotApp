import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { SystemMetrics, Container } from '../types/systemMetrics';
import { apiHandler } from '../services/apiHandler';
import { createStyles } from '../styles/theme.styles';
import { BottomBar } from './BottomBar';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { LoadingBubble } from './LoadingBubble';
import { useTool } from '../hooks/useTool';

interface LogEntry {
  timestamp: string;
  message: string;
}

interface LogsResponse {
  status: string;
  container_id: string;
  logs: LogEntry[];
}

export const SystemMonitor: React.FC = () => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [systemStats, setSystemStats] = useState<SystemMetrics | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [containerLogs, setContainerLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const styles = createStyles({ theme });
  const bottomPadding = useBottomPadding();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { setToolHeight } = useTool();
  const [logRefreshInterval, setLogRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
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
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    setToolHeight(0);
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleContainerAction = useCallback(async (containerId: string, action: 'start' | 'stop' | 'restart') => {
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
      
      fetchData();
    } catch (err) {
      setError(`Erreur ${action}`);
      addNotification('error', `Échec de l'action ${action} sur ${containerName}`);
    }
  }, [containers, addNotification, fetchData]);

  const formatBytes = useCallback((bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  const formatContainerName = useCallback((name: string): string => {
    return name.startsWith('brenda_') ? name.substring(7) : name;
  }, []);

  const fetchContainerLogs = useCallback(async (containerId: string) => {
    try {
      setLogsLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(
        `${process.env.BASE_API_URL}/monitor/containers/${containerId}/logs`,
        { signal: controller.signal }
      );

      const data = await response.json() as LogsResponse;

      if (data.status === 'success' && Array.isArray(data.logs)) {
        const formattedLogs = data.logs.map(log => {
          const timestamp = new Date(log.timestamp).toLocaleTimeString();
          return `[${timestamp}] ${log.message}`;
        });
        
        setContainerLogs(formattedLogs);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Connexion logs annulée');
      } else {
        console.error('Erreur lors de la récupération des logs:', error);
        addNotification('error', 'Erreur lors de la récupération des logs');
      }
    } finally {
      setLogsLoading(false);
      abortControllerRef.current = null;
    }
  }, [addNotification]);

  const startLogRefresh = useCallback((containerId: string) => {
    if (logRefreshInterval) {
      clearInterval(logRefreshInterval);
    }

    const interval = setInterval(() => {
      fetchContainerLogs(containerId);
    }, 10000);

    setLogRefreshInterval(interval);
  }, [fetchContainerLogs, logRefreshInterval]);

  const stopLogRefresh = useCallback(() => {
    if (logRefreshInterval) {
      clearInterval(logRefreshInterval);
      setLogRefreshInterval(null);
    }
  }, [logRefreshInterval]);

  const handleContainerClick = useCallback((containerId: string) => {
    if (selectedContainer === containerId) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      stopLogRefresh();
      setSelectedContainer(null);
      setContainerLogs([]);
    } else {
      setSelectedContainer(containerId);
      setContainerLogs([]);
      fetchContainerLogs(containerId);
      startLogRefresh(containerId);
    }
  }, [selectedContainer, fetchContainerLogs, startLogRefresh, stopLogRefresh]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopLogRefresh();
    };
  }, [stopLogRefresh]);

  if (isInitialLoad) {
    return (
      <View style={styles.systemMonitorContainer}>
        <LoadingBubble message="Chargement des données système..." />
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={styles.systemMonitorContainer}>
      {/* Header avec les stats système */}
      <View style={[styles.systemMonitorHeader, { backgroundColor: theme.colors.gray50 }]}>
        <View style={styles.systemStatsContainer}>
          <Ionicons 
            name="analytics" 
            size={24} 
            color={error ? theme.colors.error : theme.colors.success} 
          />
          {systemStats && (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>CPU</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {systemStats.cpu?.percent?.toFixed(1) || '0'}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>RAM</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {systemStats.memory?.percent?.toFixed(1) || '0'}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text }]}>Disk</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {systemStats.disk?.percent?.toFixed(1) || '0'}%
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Liste des conteneurs */}
      <View style={[styles.containersList, { marginBottom: bottomPadding }]}>
        {containers.map((container) => (
          <View key={container.id}>
            <TouchableOpacity 
              style={[
                styles.containerItem,
                { borderBottomColor: theme.colors.border }
              ]}
              onPress={() => handleContainerClick(container.id)}
            >
              <View style={styles.containerInfo}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: container.status === 'running' ? theme.colors.success : theme.colors.error }
                ]} />
                <View style={styles.containerDetails}>
                  <Text style={[styles.containerName, { color: theme.colors.text }]}>
                    {formatContainerName(container.name)}
                  </Text>
                  <Text style={[styles.containerStats, { color: theme.colors.text }]}>
                    CPU: {container.stats?.cpu_percent?.toFixed(1) || '0'}% | 
                    RAM: {container.stats?.memory_usage && formatBytes(container.stats.memory_usage)}
                  </Text>
                </View>
              </View>
              <View style={styles.containerActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                  onPress={() => handleContainerAction(container.id, 'start')}
                >
                  <Ionicons name="play" size={16} color={theme.colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={() => handleContainerAction(container.id, 'stop')}
                >
                  <Ionicons name="stop" size={16} color={theme.colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
                  onPress={() => handleContainerAction(container.id, 'restart')}
                >
                  <Ionicons name="refresh" size={16} color={theme.colors.background} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {selectedContainer === container.id && (
              <View style={styles.logsContainer}>
                {logsLoading ? (
                  <LoadingBubble message="Chargement des logs..." />
                ) : (
                  <ScrollView style={styles.logsScroll}>
                    {containerLogs.map((log, index) => (
                      <Text key={index} style={[styles.logLine, { color: theme.colors.text }]}>
                        {log}
                      </Text>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <BottomBar />
    </View>
  );
};
