import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, useWindowDimensions } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface ListAction {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  type: 'delete' | 'edit' | 'schedule' | 'move' | 'preview' | 'download' | 'compress' | 'decompress';
}

interface ListItemStyles {
  container?: ViewStyle;
  content?: ViewStyle;
  header?: ViewStyle;
  title?: TextStyle;
  description?: TextStyle;
  meta?: ViewStyle;
  metaText?: TextStyle;
  icon?: ViewStyle;
}

interface ListItemProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  leftActions?: ListAction[];
  rightActions?: ListAction[];
  onPress?: () => void;
  renderMeta?: () => React.ReactNode;
  selected?: boolean;
  customStyles?: ListItemStyles;
  size?: string;
  date?: string;
  type?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  icon,
  iconColor,
  leftActions,
  rightActions,
  onPress,
  renderMeta,
  selected,
  customStyles,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { width } = useWindowDimensions();
  const [isSwipeable, setIsSwipeable] = useState(true);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  useEffect(() => {
    setIsSwipeable(width < 768);
  }, [width]);

  const renderActions = (actions: ListAction[], direction: 'left' | 'right') => {
    const containerStyle = direction === 'left' ? styles.listItemLeftActions : styles.listItemRightActions;
    
    return (
      <View style={containerStyle}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.listItemAction,
              { backgroundColor: action.color }
            ]}
            onPress={() => {
              action.onPress();
              setIsSwipeActive(false);
            }}
          >
            <Ionicons 
              name={action.icon} 
              size={20} 
              color={theme.colors.background}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handlePress = () => {
    if (!isSwipeActive && onPress) {
      onPress();
    }
  };

  const content = (
    <TouchableOpacity
      style={[
        styles.listItem,
        selected && styles.listItemSelected,
        customStyles?.container
      ]}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={[styles.listItemContent, customStyles?.content]}>
        <View style={[styles.listItemHeader, customStyles?.header]}>
          {icon && (
            <Ionicons 
              name={icon}
              size={20}
              color={iconColor || theme.colors.text}
              style={[styles.listItemIcon, customStyles?.icon]}
            />
          )}
          <Text style={[styles.listItemTitle, customStyles?.title]}>{title}</Text>
        </View>
        {description && (
          <Text style={[styles.listItemDescription, customStyles?.description]}>
            {description}
          </Text>
        )}
        {renderMeta && renderMeta()}
      </View>
      
      {!isSwipeable && rightActions && (
        <View style={styles.listItemFixedActions}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.listItemAction,
                { backgroundColor: action.color }
              ]}
              onPress={action.onPress}
            >
              <Ionicons 
                name={action.icon} 
                size={20} 
                color={theme.colors.background}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (!isSwipeable) {
    return content;
  }

  return (
    <Swipeable
      renderLeftActions={leftActions ? () => renderActions(leftActions, 'left') : undefined}
      renderRightActions={rightActions ? () => renderActions(rightActions, 'right') : undefined}
      onSwipeableWillOpen={() => setIsSwipeActive(true)}
      onSwipeableWillClose={() => setIsSwipeActive(false)}
      overshootRight={false}
      overshootLeft={false}
    >
      {content}
    </Swipeable>
  );
}; 