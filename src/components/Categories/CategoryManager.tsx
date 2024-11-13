import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { TaskCategory } from '../../types/tasks';
import { taskCategoryService } from '../../services/taskCategoryService';
import { ColorPicker } from '../main/ColorPicker';
import { Modal, ModalAction } from '../main/Modal';
import { FormInput } from '../form/FormInput';
import { ListItem } from '../main/ListItem';

interface CategoryManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  categories: TaskCategory[];
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isVisible,
  onClose,
  onUpdate,
  categories,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [editingCategory, setEditingCategory] = useState<TaskCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4CAF50');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorTarget, setColorTarget] = useState<'new' | string>('new');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const success = await taskCategoryService.addCategory(
      newCategoryName.trim(),
      newCategoryColor
    );

    if (success) {
      setNewCategoryName('');
      setNewCategoryColor('#4CAF50');
      await onUpdate();
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    const success = await taskCategoryService.updateCategory(editingCategory);
    if (success) {
      setEditingCategory(null);
      await onUpdate();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const success = await taskCategoryService.deleteCategory(categoryId);
    if (success) {
      await onUpdate();
    }
  };

  const handleColorSelect = (color: string) => {
    if (colorTarget === 'new') {
      setNewCategoryColor(color);
    } else if (editingCategory) {
      setEditingCategory({
        ...editingCategory,
        color,
      });
    }
  };

  const renderActions = () => (
    <ModalAction variant="secondary" onPress={onClose}>
      Fermer
    </ModalAction>
  );

  const renderCategoryItem = (category: TaskCategory) => {
    if (editingCategory?.id === category.id) {
      return (
        <View style={styles.categoryEditForm}>
          <FormInput
            label="Nom de la catégorie"
            value={editingCategory.name}
            onChangeText={(text) => setEditingCategory({
              ...editingCategory,
              name: text,
            })}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.colorPicker, { backgroundColor: editingCategory.color }]}
            onPress={() => {
              setColorTarget(editingCategory.id);
              setShowColorPicker(true);
            }}
          />
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            onPress={handleUpdateCategory}
          >
            <Ionicons name="checkmark" size={20} color={theme.colors.background} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
            onPress={() => setEditingCategory(null)}
          >
            <Ionicons name="close" size={20} color={theme.colors.background} />
          </TouchableOpacity>
        </View>
      );
    }

    const rightActions = [
      {
        icon: 'pencil',
        color: theme.colors.primary,
        onPress: () => setEditingCategory(category),
        type: 'edit' as const
      },
      {
        icon: 'trash',
        color: theme.colors.error,
        onPress: () => handleDeleteCategory(category.id),
        type: 'delete' as const
      }
    ];

    const customStyles = {
      container: styles.categoryItem,
      content: styles.categoryDisplay,
      title: styles.categoryName,
    };

    return (
      <ListItem
        key={category.id}
        title={category.name}
        rightActions={rightActions}
        customStyles={customStyles}
        icon="ellipse"
        iconColor={category.color}
      />
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title="Gérer les catégories"
      actions={renderActions()}
      size="medium"
    >
      {/* Formulaire d'ajout */}
      <View style={styles.categoryForm}>
        <FormInput
          label="Nouvelle catégorie"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Nom de la catégorie"
        />
        <TouchableOpacity
          style={[styles.colorPicker, { backgroundColor: newCategoryColor }]}
          onPress={() => {
            setColorTarget('new');
            setShowColorPicker(true);
          }}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Liste des catégories */}
      <ScrollView style={styles.categoryList}>
        {categories.map(renderCategoryItem)}
      </ScrollView>

      <ColorPicker
        isVisible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
        selectedColor={colorTarget === 'new' ? newCategoryColor : editingCategory?.color || ''}
      />
    </Modal>
  );
}; 