import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { TaskCategory, Task } from '../types/tasks';
import { notificationService } from '../services/notificationService';
import { taskService } from '../services/taskService';
import { Categories } from './Categories';

interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: () => Promise<void>;
  categories: TaskCategory[];
  task?: Task;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isVisible,
  onClose,
  onAdd,
  categories,
  task,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        notificationService.notify('error', 'Erreur lors du chargement des catégories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isVisible) {
      loadCategories();
    }
  }, [isVisible]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setPriority(task.priority);
    } else if (categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [task, categories]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      notificationService.notify('error', 'Le titre est requis');
      return;
    }

    if (!category) {
      notificationService.notify('error', 'Veuillez sélectionner une catégorie');
      return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category,
      status: task?.status || 'todo',
      priority,
    };

    const success = task ? await taskService.updateTask({ ...task, ...newTask }) : await taskService.addTask(newTask);

    if (success) {
      await onAdd();
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
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
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Titre *</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Titre de la tâche"
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
              <Text style={[styles.label, { color: theme.colors.text }]}>Catégorie</Text>
              <Categories
                categories={categories}
                selectedCategory={category}
                onSelectCategory={setCategory}
                showAllOption={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Priorité</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityItem,
                      {
                        backgroundColor: 
                          p === 'high' ? `${theme.colors.error}20` :
                          p === 'medium' ? `${theme.colors.warning}20` :
                          `${theme.colors.success}20`,
                      },
                      priority === p && {
                        backgroundColor: 
                          p === 'high' ? `${theme.colors.error}40` :
                          p === 'medium' ? `${theme.colors.warning}40` :
                          `${theme.colors.success}40`,
                      }
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color: 
                            p === 'high' ? theme.colors.error :
                            p === 'medium' ? theme.colors.warning :
                            theme.colors.success,
                        },
                        priority === p && { fontWeight: 'bold' }
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                (!title.trim() || !category) && { opacity: 0.5 }
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !category}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {task ? 'Mettre à jour' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
