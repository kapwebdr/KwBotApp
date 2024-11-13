import { Theme } from '../../types/themes';

export const createNotificationsStyles = (theme: Theme) => ({
    notificationContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1000,
        maxWidth: 600,
        width: '90%',
        paddingTop: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      },
      notification: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxHeight: 60,
      },
      notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
      },
      notificationText: {
        fontSize: theme.fontSizes.medium,
        color: theme.colors.text,
        flex: 1,
      },
      notificationClose: {
        padding: 8,
        borderRadius: 4,
        marginLeft: 8,
        opacity: 0.7,
        cursor: 'pointer',
        ':hover': {
          opacity: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      },
      // Styles spécifiques par type
      notificationsuccess: {
        backgroundColor: `${theme.colors.success}40`,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.success,
      },
      notificationerror: {
        backgroundColor: `${theme.colors.error}40`,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
      },
      notificationwarning: {
        backgroundColor: `${theme.colors.warning}40`,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.warning,
      },
      notificationinfo: {
        backgroundColor: `${theme.colors.info}40`,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.info,
      },
});
