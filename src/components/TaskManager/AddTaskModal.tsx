import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { TaskCategory, Task } from '../../types/tasks';
import { notificationService } from '../../services/notificationService';
import { taskService } from '../../services/taskService';
import { Categories } from '../Categories/Categories';
import { Modal, ModalAction } from '../main/Modal';
import { FormInput } from '../form/FormInput';

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

    const success = task ? 
      await taskService.updateTask({ ...task, ...newTask }) : 
      await taskService.addTask(newTask);

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
        {task ? 'Mettre à jour' : 'Ajouter'}
      </ModalAction>
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title={task ? 'Modifier la tâche' : 'Nouvelle tâche'}
      actions={renderActions()}
      size="medium"
    >
      <View style={styles.modalBody}>
        <FormInput
          label="Titre"
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de la tâche"
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
          <Text style={styles.formLabel}>Catégorie</Text>
          <Categories
            categories={categories}
            selectedCategory={category}
            onSelectCategory={setCategory}
            showAllOption={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Priorité</Text>
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
      </View>
    </Modal>
  );
};
