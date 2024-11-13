import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createTaskManagerStyles = (theme: Theme) => ({
  taskManagerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  taskManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,

  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  } as TextStyle,

  taskListContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
  },

  taskListContent: {
    flexGrow: 1,
    padding: 16,
  } as ViewStyle,

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    marginBottom: 8,
  } as ViewStyle,

  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  taskContent: {
    flex: 1,
  } as ViewStyle,

  taskDescription: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  } as TextStyle,

  taskMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 8,
  } as ViewStyle,

  taskDueDate: {
    fontSize: 12,
    color: theme.colors.text,
  } as TextStyle,

  taskPriority: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  } as ViewStyle,

  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,

  // Styles pour le gestionnaire de catégories
  categoryHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,

  categorySelector: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    maxHeight: 50,
  } as ViewStyle,

  categoryItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  } as ViewStyle,

  categoryColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,

  categoryText: {
    fontSize: 12,
    color: theme.colors.text,
  } as TextStyle,

  categoryForm: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 16,
  } as ViewStyle,

  colorPicker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,

  prioritySelector: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginVertical: 8,
  } as ViewStyle,

  priorityItem: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  } as ViewStyle,

  taskActions: {
    flexDirection: 'row' as const,
    gap: 8,
  } as ViewStyle,

  scheduleButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  } as ViewStyle,

  taskSchedule: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,

  taskScheduleText: {
    fontSize: 12,
    color: theme.colors.text,
  } as TextStyle,

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } as ViewStyle,

  priorityText: {
    fontSize: 12,
    fontWeight: '500' as const,
  } as TextStyle,

  scheduleBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: `${theme.colors.primary}10`,
  } as ViewStyle,

  scheduleText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500' as const,
  } as TextStyle,

});
