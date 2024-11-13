import React, { useState, useEffect } from 'react';
import { View, Switch, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { calendarService } from '../../services/calendarService';
import { DateTimePicker } from '../main/DateTimePicker';
import { CalendarEvent } from '../../types/calendar';
import { TaskCategory } from '../../types/tasks';
import { Categories } from '../Categories/Categories';
import { Modal, ModalAction } from '../main/Modal';
import { FormInput } from '../form/FormInput';

interface AddEventModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: () => Promise<void>;
  selectedDate: Date | null;
  categories: TaskCategory[];
  event?: CalendarEvent;
  selectedCategory: string | null;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isVisible,
  onClose,
  onAdd,
  selectedDate,
  categories,
  event,
  selectedCategory,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(selectedDate || new Date());
  const [endDate, setEndDate] = useState(selectedDate || new Date());
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setLocation(event.location || '');
      setAllDay(event.allDay);
      setCategory(event.category?.id || null);
    } else {
      setTitle('');
      setDescription('');
      setStartDate(selectedDate || new Date());
      setEndDate(selectedDate || new Date());
      setLocation('');
      setAllDay(false);
      setCategory(selectedCategory);
    }
  }, [event, selectedDate, selectedCategory]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      startDate: allDay ? new Date(startDate).setHours(0, 0, 0, 0) : startDate.toISOString(),
      endDate: allDay ? new Date(endDate).setHours(23, 59, 59, 999) : endDate.toISOString(),
      location: location.trim(),
      allDay,
      category: categories.find(c => c.id === category) || null,
    };

    let success;
    if (event) {
      success = await calendarService.updateEvent({
        ...eventData,
        id: event.id,
        createdAt: event.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      success = await calendarService.addEvent(eventData);
    }

    if (success) {
      await onAdd();
      onClose();
    }
  };

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onClose}>
        Annuler
      </ModalAction>
      <ModalAction 
        variant="primary" 
        onPress={handleSubmit}
      >
        {event ? 'Mettre à jour' : 'Ajouter'}
      </ModalAction>
    </>
  );

  return (
    <Modal
    isVisible={isVisible}
      onClose={onClose}
      title={event ? 'Modifier l\'événement' : 'Nouvel événement'}
      actions={renderActions()}
      size="medium"
    >
      <View style={styles.modalBody}>
        <FormInput
          label="Titre"
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de l'événement"
          required
        />

        <FormInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optionnelle)"
          multiline
          numberOfLines={4}
        />

        <View style={styles.formGroup}>
          <View style={styles.formSwitch}>
            <Text style={styles.formLabel}>Toute la journée</Text>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ false: theme.colors.gray300, true: theme.colors.primary }}
              thumbColor={allDay ? theme.colors.background : theme.colors.gray100}
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

        <FormInput
          label="Date de fin"
          value={endDate.toLocaleString()}
          onPress={() => setShowEndPicker(true)}
          readonly
          icon="calendar"
          iconPosition="right"
        />

        <FormInput
          label="Lieu"
          value={location}
          onChangeText={setLocation}
          placeholder="Lieu (optionnel)"
        />

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Catégorie</Text>
          <Categories
            categories={categories}
            selectedCategory={category}
            onSelectCategory={setCategory}
            showAllOption={false}
          />
        </View>
      </View>

      <DateTimePicker
        isVisible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onConfirm={(date) => setStartDate(date)}
        initialDate={startDate}
      />

      <DateTimePicker
        isVisible={showEndPicker}
        onClose={() => setShowEndPicker(false)}
        onConfirm={(date) => setEndDate(date)}
        initialDate={endDate}
      />
    </Modal>
  );
};
