import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { calendarService } from '../services/calendarService';
import { DateTimePicker } from './DateTimePicker';
import { CalendarEvent } from '../types/calendar';
import { TaskCategory } from '../types/tasks';
import { Categories } from './Categories';

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

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {event ? 'Modifier l\'événement' : 'Nouvel événement'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Titre</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de l'événement"
                placeholderTextColor={theme.colors.gray400}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optionnelle)"
                placeholderTextColor={theme.colors.gray400}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.allDayToggle}
                onPress={() => setAllDay(!allDay)}
              >
                <View style={[
                  styles.checkbox,
                  allDay && { backgroundColor: theme.colors.primary }
                ]}>
                  {allDay && <Ionicons name="checkmark" size={16} color={theme.colors.background} />}
                </View>
                <Text style={[styles.label, { color: theme.colors.text }]}>Toute la journée</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Date de début</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {startDate.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Date de fin</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {endDate.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Lieu</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Lieu (optionnel)"
                placeholderTextColor={theme.colors.gray400}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Catégorie</Text>
              <Categories
                categories={categories}
                selectedCategory={category}
                onSelectCategory={setCategory}
                showAllOption={false}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.gray200 }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: theme.colors.primary },
                !title.trim() && { opacity: 0.5 }
              ]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {event ? 'Mettre à jour' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>
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