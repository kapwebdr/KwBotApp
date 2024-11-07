import React from 'react';
import { View } from 'react-native';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../contexts/ThemeContext';
import { BottomTabNavigator } from '../navigation/BottomTabNavigator';

interface BottomBarProps {
  ToolComponent?: React.ComponentType;
}

export const BottomBar: React.FC<BottomBarProps> = ({ ToolComponent }) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <View style={styles.bottomContainer}>
      {ToolComponent && <ToolComponent />}
      <BottomTabNavigator />
    </View>
  );
};
