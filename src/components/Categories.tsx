import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { TaskCategory } from '../types/tasks';
import { CategoryManager } from './CategoryManager';

interface CategoriesProps {
  categories: TaskCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showAllOption?: boolean;
  showManageButton?: boolean;
  onUpdate?: () => Promise<void>;
}

export const Categories: React.FC<CategoriesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showAllOption = true,
  showManageButton = false,
  onUpdate
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const handleManageCategories = () => {
    setShowCategoryManager(true);
  };

  return (
    <View style={styles.categorySelector}>
      <ScrollView 
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesWrapContent}
      >
        {showManageButton && (
        <TouchableOpacity
          style={styles.manageCategoriesButton}
          onPress={handleManageCategories}
        >
          <Ionicons name="settings-outline" size={16} color={theme.colors.text} />
          <Text style={styles.manageCategoriesText}>Gérer</Text>
        </TouchableOpacity>
      )}
        {showAllOption && (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              !selectedCategory && styles.categoryItemActive
            ]}
            onPress={() => onSelectCategory(null)}
          >
            <Text style={styles.categoryText}>Toutes</Text>
          </TouchableOpacity>
        )}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              { backgroundColor: `${category.color}20` },
              selectedCategory === category.id && styles.categoryItemActive
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
            <Text
              style={[
                styles.categoryText,
                { color: category.color },
                selectedCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      

      {showManageButton && (
        <CategoryManager
          isVisible={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          onUpdate={onUpdate}
          categories={categories}
        />
      )}
    </View>
  );
};