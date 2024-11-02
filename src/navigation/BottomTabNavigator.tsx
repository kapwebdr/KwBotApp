import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TOOL_GROUPS, getToolsInGroup, ToolType } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useTool } from '../hooks/useTool';
import { createStyles } from '../styles/theme.styles';

const Tab = createBottomTabNavigator();

const SMALL_SCREEN_WIDTH = 768;

export const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const { currentTool, setCurrentTool } = useTool();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });
  const styles = createStyles({ theme });

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ width, height });
      setIsSmallScreen(width < SMALL_SCREEN_WIDTH);
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    return () => subscription.remove();
  }, []);

  const handleGroupPress = (groupId: string) => {
    const tools = getToolsInGroup(groupId);
    if (tools.length === 1) {
      setCurrentTool(tools[0].id as ToolType);
    } else if (selectedGroup === groupId) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(groupId);
    }
  };

  const handleToolSelect = (toolId: ToolType, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setCurrentTool(toolId);
    setSelectedGroup(null);
  };

  const getSubmenuPosition = (index: number) => {
    const itemWidth = dimensions.width / TOOL_GROUPS.length;
    const itemPosition = index * itemWidth;
    const submenuWidth = 200;
    const padding = 16;
    const bottomBarHeight = 50;
    
    // Position horizontale centrée sur l'icône
    let left = itemPosition - (submenuWidth / 2) + (itemWidth / 2);
    
    // Ajustement pour éviter le débordement à gauche
    if (left < padding) {
      left = padding;
    }
    
    // Ajustement pour éviter le débordement à droite
    if (left + submenuWidth > dimensions.width - padding) {
      left = dimensions.width - submenuWidth - padding;
    }
  
    return {
      position: Platform.OS === 'web' ? 'fixed' : 'absolute',
      left,
      bottom: bottomBarHeight + padding,
      width: submenuWidth,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 1000,
    };
  };

  const renderTabBarIcon = (group: typeof TOOL_GROUPS[0], focused: boolean, index: number) => {
    const tools = getToolsInGroup(group.id);
    const isCurrentGroup = tools.some(tool => tool.id === currentTool);
    const showSubmenu = selectedGroup === group.id && tools.length > 1;
    return (
      <View style={styles.bottomBarItem}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={group.icon as any}
            size={24}
            color={isCurrentGroup ? theme.colors.primary : theme.colors.text}
          />
          {showSubmenu && (
            <View 
              style={[
                styles.toolSubmenu,
                getSubmenuPosition(index)
              ]}
            >
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[
                    styles.toolSubmenuItem,
                    currentTool === tool.id && styles.toolSubmenuItemSelected
                  ]}
                  onPress={(e) => handleToolSelect(tool.id as ToolType, e)}
                >
                  <Ionicons
                    name={tool.icon as any}
                    size={20}
                    color={currentTool === tool.id ? theme.colors.primary : theme.colors.text}
                  />
                  <Text style={[
                    styles.toolSubmenuText,
                    currentTool === tool.id && styles.toolSubmenuTextSelected
                  ]}>
                    {tool.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {(!isSmallScreen || focused) && (
          <Text style={[
            styles.bottomBarLabel,
            isCurrentGroup && styles.bottomBarLabelActive,
            { color: isCurrentGroup ? theme.colors.primary : theme.colors.text }
          ]}>
            {group.label}
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
      screenListeners={{
        tabPress: (e) => {
          e.preventDefault();
          const groupId = e.target?.split('-')[0];
          if (groupId) {
            handleGroupPress(groupId);
          }
        },
      }}
    >
      {TOOL_GROUPS.map((group) => (
        <Tab.Screen
          key={group.id}
          name={group.id}
          component={EmptyComponent}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => renderTabBarIcon(group, focused, TOOL_GROUPS.indexOf(group)),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const EmptyComponent = () => null;