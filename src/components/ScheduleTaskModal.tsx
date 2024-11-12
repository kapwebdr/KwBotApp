import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { DateTimePicker } from './DateTimePicker';
import { Task } from '../types/tasks';
import { CalendarEvent } from '../types/calendar';
import { taskService } from '../services/taskService';
import { calendarService } from '../services/calendarService';

interface ScheduleTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  task: Task;
  onScheduled: () => void;
}

export const ScheduleTaskModal: React.FC<ScheduleTaskModalProps> = ({
  isVisible,
  onClose,
  task,
  onScheduled,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 heure par défaut
  const [isAllDay, setIsAllDay] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSchedule = async () => {
    const event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
      title: task.title,
      description: task.description,
      startDate: isAllDay ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString() : startDate.toISOString(),
      endDate: isAllDay ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString() : endDate.toISOString(),
      allDay: isAllDay,
      category: task.category,
      taskId: task.id,
    };

    const createdEvent = await calendarService.addEvent(event);
    if (createdEvent) {
      const updatedTask: Task = {
        ...task,
        eventId: createdEvent.id,
        scheduledDate: createdEvent.startDate,
      };
      await taskService.updateTask(updatedTask);
      onScheduled();
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Planifier la tâche</Text>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Toute la journée</Text>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              trackColor={{ false: theme.colors.gray300, true: theme.colors.primary }}
              thumbColor={isAllDay ? theme.colors.background : theme.colors.gray100}
            />
          </View>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={[styles.datePickerButtonText, { color: theme.colors.text }]}>
              Début: {startDate.toLocaleString()}
            </Text>
          </TouchableOpacity>

          {!isAllDay && (
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.datePickerButtonText, { color: theme.colors.text }]}>
                Fin: {endDate.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.gray200 }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSchedule}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>Planifier</Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            isVisible={showStartPicker}
            onClose={() => setShowStartPicker(false)}
            onConfirm={(date) => {
              setStartDate(date);
              setShowStartPicker(false);
            }}
            initialDate={startDate}
          />

          <DateTimePicker
            isVisible={showEndPicker}
            onClose={() => setShowEndPicker(false)}
            onConfirm={(date) => {
              setEndDate(date);
              setShowEndPicker(false);
            }}
            initialDate={endDate}
          />
        </View>
      </View>
    </Modal>
  );
}; 