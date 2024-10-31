import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TOOLS } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { createStyles } from '../styles/theme.styles';

const Tab = createBottomTabNavigator();

const SMALL_SCREEN_WIDTH = 768;

export const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const { currentTool, setCurrentTool } = useTool();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const styles = createStyles({ theme });

  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallScreen(Dimensions.get('window').width < SMALL_SCREEN_WIDTH);
    };

    updateScreenSize();
    Dimensions.addEventListener('change', updateScreenSize);

    return () => {
      if (Dimensions.removeEventListener) {
        Dimensions.removeEventListener('change', updateScreenSize);
      }
    };
  }, []);

  const renderTabBarIcon = (tool: typeof TOOLS[0], focused: boolean) => {
    return (
      <View style={[styles.bottomBarItem, { paddingBottom: 8 }]}>
        <Ionicons
          name={tool.icon}
          size={24}
          color={focused ? theme.colors.primary : theme.colors.text}
        />
        {(!isSmallScreen || focused) && (
          <Text
            style={[
              styles.bottomBarLabel,
              focused && styles.bottomBarLabelActive,
              { color: focused ? theme.colors.primary : theme.colors.text }
            ]}
          >
            {tool.label}
          </Text>
        )}
      </View>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 80,
          paddingTop: 12,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
      }}
      initialRouteName={currentTool}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0];
          if (routeName) {
            setCurrentTool(routeName as any);
          }
        },
      }}
    >
      {TOOLS.map((tool) => (
        <Tab.Screen
          key={tool.id}
          name={tool.id}
          component={EmptyComponent}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => renderTabBarIcon(tool, focused),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const EmptyComponent = () => null;