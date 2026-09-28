import { useState } from 'react';

/*
  Carbon SCSS entry point — imports the White theme token layer plus all
  component styles. This must be imported once at the application root.
*/
import '@carbon/styles/css/styles.css';

import {
  Theme,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Content,
  Button,
} from '@carbon/react';

import HomePage from './components/HomePage';
import PartPage from './components/PartPage';

export default function App() {
  /*
    theme: controls the Carbon Theme wrapper.
    currentView: drives top-level navigation.
      { screen: 'home' }  → shows HomePage
      { screen: 'part', partId: 1|2|3 } → shows PartPage for that part
  */
  const [theme, setTheme] = useState('white');
  const [currentView, setCurrentView] = useState({ screen: 'home' });

  function handleThemeToggle() {
    setTheme((t) => (t === 'white' ? 'g100' : 'white'));
  }

  function handleNavigate(partId) {
    setCurrentView({ screen: 'part', partId });
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setCurrentView({ screen: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Dynamic header title based on current view
  const partTitles = {
    1: 'Part 1: Introduction to Containers',
    2: 'Part 2: Building & Running Containers',
    3: 'Part 3: Hands-On Examples',
  };
  const headerSubtitle =
    currentView.screen === 'part'
      ? ` — ${partTitles[currentView.partId]}`
      : '';

  return (
    <Theme theme={theme}>
      <Header aria-label="Containers 101">
        <HeaderName
          href="#"
          prefix=""
          onClick={(e) => {
            e.preventDefault();
            handleBack();
          }}
        >
          Containers 101{headerSubtitle}
        </HeaderName>

        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label={theme === 'white' ? 'Switch to dark mode' : 'Switch to light mode'}
            onClick={handleThemeToggle}
            tooltipAlignment="end"
          >
            {/* Sun / Moon icon via text — no extra icon package needed */}
            <span style={{ fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}>
              {theme === 'white' ? '🌙' : '☀️'}
            </span>
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <Content id="main-content">
        {currentView.screen === 'home' ? (
          <HomePage
            onNavigate={handleNavigate}
            theme={theme}
          />
        ) : (
          <PartPage
            partId={currentView.partId}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        )}
      </Content>
    </Theme>
  );
}
