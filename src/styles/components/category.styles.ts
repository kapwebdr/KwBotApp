import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createCategoryStyles = (theme: Theme) => ({
  categorySelector: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  } as ViewStyle,

  categoryItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  } as ViewStyle,

  categoryItemActive: {
    borderWidth: 2,
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

  categoryTextActive: {
    fontWeight: '600' as const,
  } as TextStyle,


  categoryList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  } as ViewStyle,

  categoryEditForm: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: 8,
  } as ViewStyle,

  categoryDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,

  categoryName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,

  categoryActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  } as ViewStyle,

  manageCategoriesButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,

  manageCategoriesText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500' as const,
  } as TextStyle,

  categoryListContent: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'flex-start' as const,
  } as ViewStyle,

  categoriesWrapContainer: {
    padding: 8,
    maxHeight: 120,
  } as ViewStyle,

  categoriesWrapContent: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  } as ViewStyle,

  categoryWrapItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  } as ViewStyle,

  categoryWrapItemActive: {
    borderWidth: 2,
  } as ViewStyle,

  categoryWrapColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,

  categoryWrapText: {
    fontSize: 12,
    color: theme.colors.text,
  } as TextStyle,

  categoryWrapTextActive: {
    fontWeight: '600' as const,
  } as TextStyle,
});
