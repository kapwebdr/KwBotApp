import { ToolType, TOOLS, Tool } from './tools';

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
    tools: ['llm']
  },
  {
    id: 'image',
    label: 'Images',
    icon: 'image',
    tools: ['image_generation']
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
    tools: ['text_to_speech', 'speech_to_text']
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: 'settings',
    tools: ['files', 'system_monitor', 'db_manager']
  },
  {
    id: 'organization',
    label: 'Organisation',
    icon: 'list',
    tools: ['task_manager', 'calendar']
  }
];

// Helper pour obtenir tous les outils d'un groupe
export const getToolsInGroup = (groupId: string): Tool[] => {
  const group = TOOL_GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  return TOOLS.filter(tool => group.tools.includes(tool.id));
};
  