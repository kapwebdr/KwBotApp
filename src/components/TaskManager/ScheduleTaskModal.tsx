import React, { useState } from 'react';
import { View, Switch, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { DateTimePicker } from '../main/DateTimePicker';
import { Task } from '../../types/tasks';
import { CalendarEvent } from '../../types/calendar';
import { taskService } from '../../services/taskService';
import { calendarService } from '../../services/calendarService';
import { Modal, ModalAction } from '../main/Modal';
import { FormInput } from '../form/FormInput';

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
        scheduledDate: event.startDate,
      };
      await taskService.updateTask(updatedTask);
      onScheduled();
      onClose();
    }
  };

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onClose}>
        Annuler
      </ModalAction>
      <ModalAction variant="primary" onPress={handleSchedule}>
        Planifier
      </ModalAction>
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title="Planifier la tâche"
      actions={renderActions()}
      size="medium"
    >
      <View style={styles.formGroup}>
        <View style={styles.formSwitch}>
          <Text style={styles.formLabel}>Toute la journée</Text>
          <Switch
            value={isAllDay}
            onValueChange={setIsAllDay}
            trackColor={{ false: theme.colors.gray300, true: theme.colors.primary }}
            thumbColor={isAllDay ? theme.colors.background : theme.colors.gray100}
          />
        </View>
      </View>

      <FormInput
        label="Date de début"
        value={startDate.toLocaleString()}
        onPress={() => setShowStartPicker(true)}
        readonly
        icon="calendar"
        iconPosition="right"
      />

      {!isAllDay && (
        <FormInput
          label="Date de fin"
          value={endDate.toLocaleString()}
          onPress={() => setShowEndPicker(true)}
          readonly
          icon="calendar"
          iconPosition="right"
        />
      )}

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
    </Modal>
  );
}; 