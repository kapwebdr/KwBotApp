import { ToolType,TOOLS,Tool } from './tools';
export interface ToolGroup {
    id: string;
    label: string;
    icon: string;
    tools: ToolType[];
  }
  
  export const TOOL_GROUPS: ToolGroup[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: 'chatbubbles',
      tools: ['llm'] //, 'audio_chat'
    },
    {
      id: 'image',
      label: 'Images',
      icon: 'image',
      tools: ['image_generation'] // , 'image_analysis', 'image_refine'
    },
    {
      id: 'text',
      label: 'Texte',
      icon: 'text',
      tools: ['ocr', 'translation']
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: 'volume-high',
      tools: ['text_to_speech','speech_to_text']
    },
    {
      id: 'files',
      label: 'Fichiers',
      icon: 'folder',
      tools: ['files']
    }
  ];
  
  // Helper pour obtenir tous les outils d'un groupe
  export const getToolsInGroup = (groupId: string): Tool[] => {
    const group = TOOL_GROUPS.find(g => g.id === groupId);
    if (!group) return [];
    return TOOLS.filter(tool => group.tools.includes(tool.id));
  };
  