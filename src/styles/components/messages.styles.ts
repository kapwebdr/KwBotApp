import { Theme } from '../../types/themes';

export const createMessagesStyles = (theme: Theme) => {
  return {
    messageList: {
        padding: 10,
        flexGrow: 1,
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
      conversationsSection: {
        flex: 1,
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
      messageAudio: {
        width: '100%',
        minWidth: 200,
        maxWidth: 400,
        marginVertical: 4,
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
  };
};
