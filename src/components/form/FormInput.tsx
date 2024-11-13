import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  required?: boolean;
  error?: string;
  style?: ViewStyle;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  onIconPress?: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  readonly?: boolean;
  helper?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required,
  error,
  style,
  onPress,
  icon,
  iconPosition = 'right',
  iconColor,
  onIconPress,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  readonly,
  helper,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const renderInput = () => (
    <View style={[
      styles.formInputContainer,
      inputContainerStyle,
      error && styles.formInputError
    ]}>
      {icon && iconPosition === 'left' && (
        <TouchableOpacity
          onPress={onIconPress}
          disabled={!onIconPress}
          style={styles.formInputIcon}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || theme.colors.text}
          />
        </TouchableOpacity>
      )}

      <TextInput
        style={[
          styles.formInput,
          props.multiline && styles.formTextArea,
          icon && iconPosition === 'left' && styles.formInputWithLeftIcon,
          icon && iconPosition === 'right' && styles.formInputWithRightIcon,
          style
        ]}
        placeholderTextColor={theme.colors.gray400}
        editable={!readonly && !onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
        {...props}
      />

      {icon && iconPosition === 'right' && (
        <TouchableOpacity
          onPress={onIconPress}
          disabled={!onIconPress}
          style={styles.formInputIcon}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || theme.colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.formGroup, containerStyle]}>
      <Text style={[styles.formLabel, labelStyle]}>
        {label}
        {required && <Text style={styles.formRequired}>*</Text>}
      </Text>

      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={props.editable === false}
        >
          {renderInput()}
        </TouchableOpacity>
      ) : (
        renderInput()
      )}

      {helper && !error && (
        <Text style={styles.formHelper}>{helper}</Text>
      )}

      {error && (
        <Text style={styles.formError}>{error}</Text>
      )}
    </View>
  );
};
