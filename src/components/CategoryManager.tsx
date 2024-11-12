import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { TaskCategory } from '../types/tasks';
import { taskCategoryService } from '../services/taskCategoryService';
import { ColorPicker } from './ColorPicker';

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
              Gérer les catégories
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Formulaire d'ajout */}
            <View style={styles.categoryForm}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Nouvelle catégorie"
                placeholderTextColor={theme.colors.gray400}
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
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  {editingCategory?.id === category.id ? (
                    <View style={styles.categoryEditForm}>
                      <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
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
                  ) : (
                    <View style={styles.categoryDisplay}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                        {category.name}
                      </Text>
                      <View style={styles.categoryActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => setEditingCategory(category)}
                        >
                          <Ionicons name="pencil" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteCategory(category.id)}
                        >
                          <Ionicons name="trash" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      <ColorPicker
        isVisible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
        selectedColor={colorTarget === 'new' ? newCategoryColor : editingCategory?.color || ''}
      />
    </Modal>
  );
}; 