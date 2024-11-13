import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { useNotification } from '../../hooks/useNotification';

export const NotificationManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { notifications, removeNotification } = useNotification();

  return (
    <View style={styles.notificationContainer}>
      {notifications.map(notification => (
        <TouchableOpacity 
          key={notification.id}
          onPress={() => removeNotification(notification.id)}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.notification,
              styles[`notification${notification.type}`],
            ]}
          >
            <View style={styles.notificationContent}>
              <Ionicons 
                name={getIconName(notification.type)}
                size={20}
                color={getIconColor(notification.type, theme)}
              />
              <Text style={[
                styles.notificationText,
                styles[`notificationText${notification.type}`],
              ]}>
                {notification.message}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              style={styles.notificationClose}
            >
              <Ionicons 
                name="close" 
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getIconName = (type: NotificationType): string => {
  switch (type) {
    case 'success': return 'checkmark-circle';
    case 'error': return 'alert-circle';
    case 'warning': return 'warning';
    case 'info': return 'information-circle';
  }
};

const getIconColor = (type: NotificationType, theme: Theme): string => {
  switch (type) {
    case 'success': return theme.colors.success;
    case 'error': return theme.colors.error;
    case 'warning': return theme.colors.warning;
    case 'info': return theme.colors.info;
  }
}; 