import { StyleSheet } from 'react-native';
import { Theme } from '../types/themes';
import { lightTheme } from '../theme';

export const createStyles = (themeContext: { theme: Theme }) => {
  const theme = themeContext?.theme || lightTheme;
  
  const baseButton = {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    width: 44,
    height: 44,
    backgroundColor: theme.colors.inputBackground,
  };

  const baseButtonIcon = {
    size: 24,
    color: theme.colors.primary,
  };

  const baseButtonDisabled = {
    opacity: 0.5,
    backgroundColor: theme.colors.gray100,
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: theme.colors.background,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      height: 60,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      zIndex: 900,
    },

    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },

    contentContainer: {
      flex: 1,
      overflow: 'auto',
    },

    messageList: {
      padding: 10,
      flexGrow: 1,
    },

    toolContainer: {
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    toolConfigContent: {
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },

    bottomNavigation: {
      height: 80,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    // Tous les styles de ChatBot.tsx qui dépendent du thème
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },
    sidebarOverlay: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      width: '80%',
      maxWidth: 300,
    },
    modalText: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButton: {
      padding: 10,
      borderRadius: 5,
      minWidth: 100,
      alignItems: 'center',
    },
    modalButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    newConversationButton: {
      padding: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      margin: 10,
    },
    newConversationButtonText: {
      color: theme.colors.background,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    conversationItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    conversationItem: {
      flex: 1,
      paddingRight: 10,
    },
    conversationItemActive: {
      backgroundColor: theme.colors.gray100,
    },
    conversationTimestamp: {
      fontSize: 12,
      color: theme.colors.text,
      opacity: 0.7,
    },
    conversationPreview: {
      color: theme.colors.text,
      fontSize: 14,
      marginTop: 4,
    },
    deleteButton: {
      padding: 5,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 8,
      marginVertical: 5,
      zIndex: 1,
      ':hover': {
        '.messageActions': {
          display: 'flex',
        }
      }
    },
    userBubble: {
      backgroundColor: theme.colors.userBubble,
      alignSelf: 'flex-end',
      marginLeft: '20%',
    },
    aiBubble: {
      backgroundColor: theme.colors.aiBubble,
      alignSelf: 'flex-start',
      marginRight: '20%',
      paddingBottom:20
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
    },
    userText: {
      color: theme.colors.userText,
    },
    aiText: {
      color: theme.colors.aiText,
    },
    toolControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
      width: '100%',
    },
    toolSelector: {
      position: 'relative',
      zIndex: 100,
      minWidth: 180,
      maxWidth: 180,
    },
    toolDropdownButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.gray100,
      minWidth: 180,
    },
    toolDropdownButtonActive: {
      backgroundColor: theme.colors.gray150,
    },
    toolDropdownContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toolDropdownText: {
      color: theme.colors.text,
      fontSize: 14,
      flex: 1,
    },
    toolDropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      backgroundColor: theme.colors.background,
      borderRadius: 6,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toolMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
      borderRadius: 4,
    },
    toolMenuItemActive: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    toolMenuItemText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    toolMenuItemTextActive: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },

    // Styles pour InputBar
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '100%',
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: theme.fontSizes.medium,
      color: theme.colors.text,
      minHeight: 40,
    },
    sendButton: {
      ...baseButton,
      marginLeft: 'auto',
    },
    sendButtonDisabled: {
      ...baseButtonDisabled,
    },
    uploadButton: {
      ...baseButton,
    },

    // Styles pour ToolConfig
    configFields: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 10,
    },
    configField: {
      flex: 1,
      minWidth: 200,
      marginBottom: 8,
    },
    configLabel: {
      color: theme.colors.text,
      fontSize: 14,
      marginBottom: 4,
    },
    inputBarWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },
    uploadContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },

    // Styles pour les fichiers en attente
    pendingFileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 4,
    },
    pendingFileName: {
      color: theme.colors.text,
      fontSize: 12,
      maxWidth: 120,
    },
    clearFileButton: {
      marginLeft: 4,
      padding: 2,
    },

    // Styles pour les états désactivés
    inputDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray100,
      color: theme.colors.gray400,
    },
    sendButtonDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray100,
    },
    stopButton: {
      ...baseButton,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    selectContainer: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 4,
      minWidth: 120,
      padding: 4,
    },
    select: {
      width: '100%',
      backgroundColor: 'transparent',
      color: theme.colors.text,
      borderWidth: 0,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    selectDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray100,
      color: theme.colors.gray400,
    },
    selectIcon: {
      position: 'absolute',
      right: 8,
      top: '50%',
      transform: [{ translateY: -8 }],
      pointerEvents: 'none',
    },
    toolBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    toolConfigBar: {
      width: '100%',
      padding: 10,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      padding: 10,
    },
    toolsSection: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 10,
    },
    toolItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      gap: 10,
    },
    toolItemActive: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    toolItemText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    toolItemTextActive: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    conversationsSection: {
      flex: 1,
    },
    toolOptionsBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
      position: 'relative',
    },
    toolButton: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 8,
    },
    toolButtonActive: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    toolButtonSelected: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    toolButtonText: {
      fontSize: 12,
      color: theme.colors.text,
      marginTop: 4,
    },
    toolButtonTextActive: {
      color: theme.colors.primary,
    },
    toolSubmenu: {
      position: 'absolute',
      zIndex: 1000,
    },
    toolSubmenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 4,
      marginVertical: 2,
    },
    toolSubmenuItemSelected: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    toolSubmenuText: {
      marginLeft: 12,
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    toolSubmenuTextSelected: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    bottomBarItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      position: 'relative',
    },
    iconContainer: {
      alignItems: 'center',
    },
    fileUploadConfig: {
      padding: 10,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    codeBlockContainer: {
      position: 'relative',
      width: '100%',
      marginVertical: 8,
    },
    messageImage: {
      width: 300,
      height: 300,
      borderRadius: 8,
    },
    imageGenerationProgress: {
      padding: 10,
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginTop: 10,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    uploadButtons: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    uploadButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.inputBackground,
    },
    // Styles pour les selects et autres éléments web
    select: {
      width: '100%',
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      borderWidth: 0,
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    selectContainer: {
      position: 'relative',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 4,
      padding: 4,
      minWidth: 120,
      flex: 1,
    },
    selectIcon: {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
    },
    selectDisabled: {
      opacity: 0.5,
    },
    configRow: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      width: '100%',
    },
    configColumn: {
      flex: 1,
      minWidth: 200,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      borderRadius: 4,
      padding: 8,
      fontSize: 14,
      width: '100%',
      minHeight: 36,
    },
    // Styles pour le texte désactivé
    textDisabled: {
      color: theme.colors.gray400,
    },
    // Styles pour les placeholders désactivés
    placeholderDisabled: {
      color: theme.colors.gray300,
    },
    toolDropdownButtonDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray100,
    },
    // Styles pour la bottom bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 56,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 10,
    },
    bottomBarItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 5,
    },
    bottomBarLabel: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    bottomBarLabelActive: {
      fontWeight: 'bold',
    },
    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      zIndex: 800,
    },
    systemStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.gray100,
      zIndex: 900,
    },
    statusIcon: {
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'monospace',
    },
    voiceButton: {
      ...baseButton,
    },
    voiceButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    voiceButtonDisabled: {
      ...baseButtonDisabled,
    },
    // Styles pour le sélecteur de thème
    themeSelector: {
      position: 'relative',
      zIndex: 1000,
    },
    themeButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.gray100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeDropdownMenu: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 4,
      backgroundColor: theme.colors.background,
      borderRadius: 6,
      padding: 4,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 1001,
    },
    themeMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
      borderRadius: 4,
    },
    themeMenuItemActive: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    themeMenuItemText: {
      color: theme.colors.text,
      fontSize: 14,
      marginLeft: 8,
    },
    themeMenuItemTextActive: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    loadingBubble: {
      maxWidth: '60%',
    },
    loadingContent: {
      alignItems: 'center',
      gap: 10,
    },
    loadingDots: {
      flexDirection: 'row',
      gap: 4,
    },
    loadingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    progressContainer: {
      width: '100%',
      alignItems: 'center',
      gap: 4,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    messagesContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
    },
    messagesList: {
      flex: 1,
      overflow: 'scroll',
      paddingLeft: 10,
      paddingRight: 10,
    },
    messageContent: {
      position: 'relative',
      width: '100%',
    },
    messageActions: {
      position: 'absolute',
      bottom: -30,
      right: -10,
      flexDirection: 'row',
      gap: 4,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      padding: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      zIndex: 2,
    },
    actionButton: {
      padding: 4,
      borderRadius: 4,
      backgroundColor: theme.colors.aiBubble,
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
    },
    actionButtonActive: {
      backgroundColor: theme.colors.userBubble,
    },
    actionIcon: {
      color: theme.colors.aiText,
    },
    actionIconActive: {
      color: theme.colors.userText,
    },
    // Styles de base pour les boutons
    baseButton,
    baseButtonDisabled,

    // Bouton d'upload
    uploadButton: {
      ...baseButton,
    },

    // Bouton URL
    urlButton: {
      ...baseButton,
    },

    // Bouton d'envoi
    sendButton: {
      ...baseButton,
    },
    sendButtonDisabled: {
      ...baseButtonDisabled,
    },

    // Bouton vocal
    voiceButton: {
      ...baseButton,
    },
    voiceButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    voiceButtonDisabled: {
      ...baseButtonDisabled,
    },

    // Bouton stop
    stopButton: {
      ...baseButton,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },

    // Style pour les icônes des boutons
    buttonIcon: {
      ...baseButtonIcon,
    },
    buttonIconDisabled: {
      color: theme.colors.gray400,
    },
    buttonIconActive: {
      color: theme.colors.background,
    },
    messageAudio: {
      width: '100%',
      minWidth: 200,
      maxWidth: 400,
      marginVertical: 4,
    },
    iconContainer: {
      position: 'relative',
    },
    toolSubmenu: {
      position: 'absolute',
      zIndex: 1000,
    },
    toolSubmenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 4,
    },
    toolSubmenuItemSelected: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    toolSubmenuText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.colors.text,
    },
    toolSubmenuTextSelected: {
      color: theme.colors.primary,
    },
    codeBlockContainer: {
      backgroundColor: theme.colors.codeBackground,
      borderRadius: 8,
      marginVertical: 8,
      overflow: 'hidden',
    },
    codeBlockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      backgroundColor: theme.colors.codeBorder,
    },
    codeBlockLanguage: {
      color: theme.colors.codeText,
      fontSize: 12,
      fontFamily: 'monospace',
    },
    codeBlockContent: {
      padding: 12,
      fontFamily: 'monospace',
    },
    fileManager: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    toolbarButton: {
      padding: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    currentPath: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
    },
    fileList: {
      flex: 1,
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    fileItemSelected: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    fileName: {
      flex: 1,
      marginLeft: 12,
      color: theme.colors.text,
      fontSize: 14,
    },
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
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      flexWrap: 'wrap',
    },
    breadcrumbItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
      borderRadius: 4,
    },
    breadcrumbText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    breadcrumbSeparator: {
      color: theme.colors.text,
      marginHorizontal: 4,
      opacity: 0.5,
    },
    toolbarActions: {
      flexDirection: 'row',
      gap: 8,
    },
    toolbarButton: {
      padding: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.gray100,
    },
    newFolderInput: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 4,
      padding: 8,
      marginRight: 8,
      color: theme.colors.text,
    },
    inputButton: {
      padding: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.gray100,
      marginLeft: 4,
    },
    fileListContainer: {
      flex: 1,
      position: 'relative',
    },
    dragOver: {
      backgroundColor: `${theme.colors.primary}10`,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fileList: {
      flex: 1,
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    fileItemSelected: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    fileDetails: {
      flex: 1,
      marginLeft: 12,
    },
    fileName: {
      color: theme.colors.text,
      fontSize: 14,
    },
    fileInfo: {
      color: theme.colors.text,
      fontSize: 12,
      opacity: 0.7,
      marginTop: 2,
    },
    // Styles pour les champs en erreur
    configFieldError: {
      borderColor: theme.colors.error,
    },

    configLabelError: {
      color: theme.colors.error,
    },

    textInputError: {
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: `${theme.colors.error}10`,
    },

    selectContainerError: {
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: `${theme.colors.error}10`,
    },

    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },

    requiredStar: {
      color: theme.colors.error,
      marginLeft: 4,
    },

    notificationContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 1000,
      maxWidth: 600,
      width: '90%',
      paddingTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },

    notification: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      maxHeight: 60,
    },

    notificationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },

    notificationText: {
      fontSize: theme.fontSizes.medium,
      color: theme.colors.text,
      flex: 1,
    },

    notificationClose: {
      padding: 8,
      borderRadius: 4,
      marginLeft: 8,
      opacity: 0.7,
      cursor: 'pointer',
      ':hover': {
        opacity: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      },
    },

    // Styles spécifiques par type
    notificationsuccess: {
      backgroundColor: `${theme.colors.success}40`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.success,
    },

    notificationerror: {
      backgroundColor: `${theme.colors.error}40`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.error,
    },

    notificationwarning: {
      backgroundColor: `${theme.colors.warning}40`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },

    notificationinfo: {
      backgroundColor: `${theme.colors.info}40`,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.info,
    },

    disabledButton: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray400,
    },

    disabledButtonText: {
      opacity: 0.7,
    },
  });
};

// Pour les éléments select natifs web
export const getSelectStyle = (themeContext: { theme: Theme }, isDisabled: boolean) => {
  const theme = themeContext?.theme || lightTheme;
  
  return {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    border: 'none',
    borderRadius: '5px',
    padding: '8px',
    fontSize: '14px',
    outline: 'none',
    cursor: isDisabled ? 'wait' : 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    opacity: isDisabled ? 0.5 : 1,
    width: '100%',
  };
};

// Styles spécifiques pour les éléments web
export const getWebStyles = (themeContext: { theme: Theme }) => {
  const theme = themeContext?.theme || lightTheme;
  
  return {
    select: {
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      border: 'none',
      borderRadius: 5,
      padding: 8,
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      width: '100%',
    },
  };
};
