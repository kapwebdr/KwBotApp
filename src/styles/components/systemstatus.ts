import { Theme } from '../../types/themes';

export const createSystemStatusStyles = (theme: Theme) => {
  return {
    systemStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 4,
        borderRadius: 4,
        backgroundColor: theme.colors.gray100,
        zIndex: 900,
      },
      statusIcon: {
        marginRight: 4,
      },
      statusText: {
        fontSize: 12,
        fontFamily: 'monospace',
      },
      monitoringContainer: {
        position: 'relative',
        flex: 1,
        marginHorizontal: 10,
      },
      monitoringStatsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        borderRadius: 4,
        gap: 8,
      },
      monitoringIcon: {
        marginRight: 4,
      },
      monitoringStatsText: {
        fontSize: 12,
        fontFamily: 'monospace',
      },
      monitoringContainersDropdown: {
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
      monitoringContainerItem: {
        marginVertical: 2,
      },
      monitoringContainerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      },
      monitoringContainerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
      },
      monitoringStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
      },
      monitoringContainerName: {
        fontSize: 12,
        fontFamily: 'monospace',
      },
      monitoringActions: {
        flexDirection: 'row',
        gap: 4,
      },
      monitoringActionButton: {
        padding: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
  };
};