import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  actions?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  onNavigate,
  actions,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const pathParts = path.split('/').filter(Boolean);

  return (
    <View style={styles.breadcrumbContainer}>
      <View style={styles.breadcrumbContent}>
        <TouchableOpacity
          style={[styles.breadcrumbItem, styles.breadcrumbItemClickable]}
          onPress={() => onNavigate('/')}
        >
          <Ionicons name="home" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        
        {pathParts.map((part, index, parts) => {
          const pathUpToHere = '/' + parts.slice(0, index + 1).join('/');
          return (
            <React.Fragment key={index}>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <TouchableOpacity
                style={[
                  styles.breadcrumbItem,
                  styles.breadcrumbItemClickable,
                  pathUpToHere === path && styles.breadcrumbItemActive
                ]}
                onPress={() => onNavigate(pathUpToHere)}
              >
                <Text style={[
                  styles.breadcrumbText,
                  pathUpToHere === path && styles.breadcrumbTextActive
                ]}>
                  {part}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {actions && (
        <View style={styles.breadcrumbActions}>
          {actions}
        </View>
      )}
    </View>
  );
}; 