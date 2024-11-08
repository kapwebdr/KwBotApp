import { ThemeProvider } from './contexts/ThemeContext';
import { ToolProvider } from './contexts/ToolContext';
import { FileManagerProvider } from './contexts/FileManagerContext';

const App = () => {
  return (
    <ThemeProvider>
      <ToolProvider>
        <FileManagerProvider>
          {/* reste de l'application */}
        </FileManagerProvider>
      </ToolProvider>
    </ThemeProvider>
  );
}; 