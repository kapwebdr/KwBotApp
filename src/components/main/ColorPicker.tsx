import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { Modal } from './Modal';

interface ColorPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  selectedColor: string;
}

const COLORS = [
  { value: '#4CAF50', label: 'Vert' },
  { value: '#2196F3', label: 'Bleu' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#E91E63', label: 'Rose' },
  { value: '#9C27B0', label: 'Violet' },
  { value: '#F44336', label: 'Rouge' },
  { value: '#00BCD4', label: 'Cyan' },
  { value: '#009688', label: 'Teal' },
  { value: '#FFEB3B', label: 'Jaune' },
  { value: '#795548', label: 'Marron' },
  { value: '#607D8B', label: 'Bleu gris' },
  { value: '#3F51B5', label: 'Indigo' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  isVisible,
  onClose,
  onSelectColor,
  selectedColor,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title="Choisir une couleur"
      size="small"
    >
      <View style={styles.colorGrid}>
        {COLORS.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.colorItem,
              { backgroundColor: value },
              selectedColor === value && styles.colorItemSelected,
            ]}
            onPress={() => {
              onSelectColor(value);
              onClose();
            }}
          >
            {selectedColor === value && (
              <View style={styles.colorItemCheck}>
                <Text style={styles.colorItemCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};
