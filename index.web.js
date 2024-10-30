import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('ChatbotApp', () => App);
AppRegistry.runApplication('ChatbotApp', {
  rootTag: document.getElementById('root')
});
