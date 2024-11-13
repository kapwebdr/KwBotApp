import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: (string | SelectOption)[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  helper?: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onIconPress?: () => void;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  required,
  error,
  disabled,
  placeholder = 'Sélectionner...',
  helper,
  loading,
  icon,
  iconColor,
  onIconPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.formRequired}>*</Text>}
      </Text>

      <View style={[
        styles.formSelectContainer,
        error && styles.formInputError,
        disabled && styles.formInputDisabled
      ]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled && !loading}
          style={styles.formSelect}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => {
            if (typeof option === 'string') {
              return (
                <Picker.Item key={option} label={option} value={option} />
              );
            } else {
              return (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              );
            }
          })}
        </Picker>

        {icon && (
          <TouchableOpacity
            style={styles.formSelectIcon}
            onPress={onIconPress}
            disabled={!onIconPress}
          >
            <Ionicons
              name={icon}
              size={20}
              color={iconColor || theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.formSelectIcon}>
            <Ionicons
              name="reload"
              size={20}
              color={theme.colors.text}
            />
          </View>
        )}
      </View>

      {helper && !error && (
        <Text style={styles.formHelper}>{helper}</Text>
      )}

      {error && (
        <Text style={styles.formError}>{error}</Text>
      )}
    </View>
  );
}; 