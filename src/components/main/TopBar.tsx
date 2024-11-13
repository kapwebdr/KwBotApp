import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { useTool } from '../../hooks/useTool';
import { createStyles } from '../../styles/theme.styles';
import { Sidebar } from './Sidebar';

const SIDEBAR_WIDTH = 250;

export const TopBar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { theme } = useTheme();
  const { currentTool } = useTool();
  const styles = createStyles({ theme });

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    Animated.timing(sidebarAnimation, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <>
      <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {currentTool && (
            <View style={styles.toolInfo}>
              <Ionicons 
                name={currentTool.icon as any} 
                size={20} 
                color={theme.colors.primary} 
                style={styles.toolIcon}
              />
              <Text style={[styles.text, styles.toolLabel]}>
                {currentTool.label}
              </Text>
            </View>
          )}
          <ThemeSelector />
      </View>

      {isSidebarOpen && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.sidebarOverlay} />
        </TouchableWithoutFeedback>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        sidebarAnimation={sidebarAnimation}
        onClose={closeSidebar}
      />
    </>
  );
};
