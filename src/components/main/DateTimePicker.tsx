import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { Modal, ModalAction } from './Modal';
import { Ionicons } from '@expo/vector-icons';
interface DateTimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialDate = new Date(),
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', value: number) => {
    const newDate = new Date(selectedDate);
    if (type === 'day') newDate.setDate(value);
    if (type === 'month') newDate.setMonth(value);
    if (type === 'year') newDate.setFullYear(value);
    setSelectedDate(newDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    const newDate = new Date(selectedDate);
    if (type === 'hours') newDate.setHours(value);
    if (type === 'minutes') newDate.setMinutes(value);
    setSelectedDate(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onClose}>
        Annuler
      </ModalAction>
      <ModalAction variant="primary" onPress={handleConfirm}>
        Confirmer
      </ModalAction>
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title="Sélectionner la date et l'heure"
      actions={renderActions()}
      size="medium"
    >
      <View style={styles.dateTimePickerBody}>
        {/* Sélecteur de date */}
        <View style={styles.calendarSection}>
          <View style={styles.monthYearSelector}>
            <TouchableOpacity onPress={() => handleDateChange('month', selectedDate.getMonth() - 1)}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthYearText, { color: theme.colors.text }]}>
              {selectedDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => handleDateChange('month', selectedDate.getMonth() + 1)}>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysGrid}>
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
              <Text key={`day-${index}`} style={[styles.dayLabel, { color: theme.colors.gray400 }]}>
                {day}
              </Text>
            ))}
            {Array.from({ length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) }, (_, i) => (
              <TouchableOpacity
                key={`date-${i + 1}`}
                style={[
                  styles.dayButton,
                  selectedDate.getDate() === i + 1 && styles.selectedDayButton,
                ]}
                onPress={() => handleDateChange('day', i + 1)}
              >
                <Text style={[
                  styles.dayButtonText,
                  { color: theme.colors.text },
                  selectedDate.getDate() === i + 1 && { color: theme.colors.background }
                ]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sélecteur d'heure */}
        <View style={styles.timeSection}>
          <Text style={[styles.timeLabel, { color: theme.colors.text }]}>Heure</Text>
          <View style={styles.timeSelector}>
            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={[styles.timeButton, styles.timeButtonActive]}
                onPress={() => handleTimeChange('hours', (selectedDate.getHours() + 1) % 24)}
              >
                <Ionicons name="chevron-up" size={20} color={theme.colors.background} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {selectedDate.getHours().toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity
                style={[styles.timeButton, styles.timeButtonActive]}
                onPress={() => handleTimeChange('hours', (selectedDate.getHours() - 1 + 24) % 24)}
              >
                <Ionicons name="chevron-down" size={20} color={theme.colors.background} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.timeSeparator, { color: theme.colors.text }]}>:</Text>

            <View style={styles.timeColumn}>
              <TouchableOpacity
                style={[styles.timeButton, styles.timeButtonActive]}
                onPress={() => handleTimeChange('minutes', (selectedDate.getMinutes() + 1) % 60)}
              >
                <Ionicons name="chevron-up" size={20} color={theme.colors.background} />
              </TouchableOpacity>
              <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                {selectedDate.getMinutes().toString().padStart(2, '0')}
              </Text>
              <TouchableOpacity
                style={[styles.timeButton, styles.timeButtonActive]}
                onPress={() => handleTimeChange('minutes', (selectedDate.getMinutes() - 1 + 60) % 60)}
              >
                <Ionicons name="chevron-down" size={20} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 