import { AppRegistry } from 'react-native';
import App from './App';

/*
  React Native Web requires the app to be registered and then started against
  the DOM root element. AppRegistry.runApplication replaces the React 18
  createRoot call — RNW handles that bridge internally.
*/
AppRegistry.registerComponent('LaunchNextChapter', () => App);
AppRegistry.runApplication('LaunchNextChapter', {
  rootTag: document.getElementById('root'),
});
