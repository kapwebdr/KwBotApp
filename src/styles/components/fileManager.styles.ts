import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react';

export const createFileManagerStyles = (theme: Theme) => ({
fileManager: {
  flex: 1,
  backgroundColor: theme.colors.background,
},
fileInfo: {
  color: theme.colors.text,
  fontSize: 12,
  opacity: 0.7,
  marginTop: 2,
},
toolbarButton: {
  padding: 8,
  borderRadius: 4,
  marginRight: 8,
},
fileList: {
  flex: 1,
},
fileItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  height: 48,
} as ViewStyle,
fileItemSelected: {
  backgroundColor: `${theme.colors.primary}20`,
},
fileName: {
  flex: 1,
  fontSize: 14,
  color: theme.colors.text,
} as TextStyle,
fileSize: {
  color: theme.colors.text,
  fontSize: 12,
  opacity: 0.7,
},
loadingText: {
  padding: 20,
  textAlign: 'center',
  color: theme.colors.text,
},
fileManagerContainer: {
  flex: 1,
  backgroundColor: theme.colors.background,
  height: '100%',
},
fileManagerToolbar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: theme.colors.gray50,
},
toolbarActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
newFolderInput: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
  backgroundColor: theme.colors.background,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
},
fileUploadConfig: {
  padding: 10,
  backgroundColor: theme.colors.background,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.colors.border,
  marginBottom: 10,
},
inputButton: {
  padding: 8,
  marginLeft: 8,
},
uploadActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.primary,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 4,
  marginLeft: 8,
  gap: 8,
},
uploadActionButtonDisabled: {
  opacity: 0.5,
},
uploadActionButtonText: {
  color: theme.colors.background,
  fontSize: 14,
  fontWeight: '500',
},
fileItemDirectory: {
  backgroundColor: `${theme.colors.primary}10`,
},
fileItemMove: {
  backgroundColor: theme.colors.primary,
},
fileItemMoveIcon: {
  color: theme.colors.background,
},
fileItemActionPreview: {
  backgroundColor: theme.colors.info,
},
fileItemActionRename: {
  backgroundColor: theme.colors.warning,
},
fileItemContent: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
} as ViewStyle,
fileItemHeader: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
} as ViewStyle,
fileItemIcon: {
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
} as ViewStyle,
fileItemMeta: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
  marginLeft: 'auto',
} as ViewStyle,
fileItemMetaText: {
  fontSize: 12,
  color: theme.colors.gray400,
} as TextStyle,
});
