import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { ThemeType, THEME_OPTIONS } from '../../types/themes';

export const ThemeSelector: React.FC = () => {
  const { theme, currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const styles = createStyles({ theme });

  const handleThemeChange = (themeType: ThemeType) => {
    setTheme(themeType);
    setIsOpen(false);
  };

  const getThemeIcon = (themeType: ThemeType): string => {
    return THEME_OPTIONS[themeType]?.icon || 'color-palette-outline';
  };

  const handleOutsideClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <View style={styles.themeSelector}>
      <TouchableOpacity
        style={styles.themeButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Ionicons 
          name={getThemeIcon(currentTheme)} 
          size={24} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>

      {isOpen && (
        <TouchableWithoutFeedback onPress={handleOutsideClick}>
          <View style={styles.themeDropdownMenu}>
            {Object.entries(THEME_OPTIONS).map(([key, option]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeMenuItem,
                  currentTheme === key && styles.themeMenuItemActive
                ]}
                onPress={() => handleThemeChange(key as ThemeType)}
              >
                <Ionicons 
                  name={option.icon} 
                  size={20} 
                  color={currentTheme === key ? theme.colors.primary : theme.colors.text} 
                />
                <Text style={[
                  styles.themeMenuItemText,
                  currentTheme === key && styles.themeMenuItemTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};