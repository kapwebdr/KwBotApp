import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConversationProvider } from './contexts/ConversationContext';
import { ToolProvider } from './contexts/ToolContext';
import ChatBot from './ChatBot';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ConversationProvider>
        <ToolProvider>
          <ChatBot />
        </ToolProvider>
      </ConversationProvider>
    </ThemeProvider>
  );
};

export default App; 