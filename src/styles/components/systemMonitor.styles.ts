import { Theme } from '../../types/themes';

export const createSystemMonitorStyles = (theme: Theme) => ({
  systemMonitorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  systemMonitorHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  systemStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  containersList: {
    backgroundColor: theme.colors.background,
    flex: 1,
    padding: 16,
    position: 'relative',
    overflow: 'auto',
  },
  containerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  containerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  containerDetails: {
    flex: 1,
  },
  containerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  containerStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  containerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
  logsContainer: {
    marginTop: 8,
    backgroundColor: theme.colors.gray100,
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  logsTitle: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  refreshButton: {
    padding: 4,
    borderRadius: 4,
  } as ViewStyle,
  logsScroll: {
    maxHeight: 200,
    padding: 8,
  } as ViewStyle,
  logLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  } as TextStyle,
});
