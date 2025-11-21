import React, { useState, useEffect } from 'react';
import { MantineProvider, AppShell, Group, Title, Button, Tabs, ThemeIcon, ActionIcon, Indicator, Tooltip, Grid, useMantineColorScheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { IconActivity, IconPlus, IconSettings, IconServer, IconHelp, IconSun, IconMoon } from '@tabler/icons-react';
import { ConfigPanel } from './components/ConfigPanel';
import { CreateEventForm } from './components/CreateEventForm';
import { EventList } from './components/EventList';
import { RequestInspector } from './components/RequestInspector';
import { ThemeToggle } from './components/ThemeToggle';
import { DebugPanel } from './components/DebugPanel';
import { useRequestStore } from './lib/store';
import { Footer } from './components/Footer';
import { WelcomeModal } from './components/WelcomeModal';

function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('dd_config');
    return saved ? JSON.parse(saved) : { apiKey: '', appKey: '', site: 'datadoghq.com', proxyUrl: 'https://dev-datadog.pantheonsite.io/event-proxy.php' };
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false); // New state for WelcomeModal
  const requestCount = useRequestStore(state => state.requests.length);
  const errorCount = useRequestStore(state => state.errors.length);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme(); // Added for ThemeToggle replacement

  useEffect(() => {
    localStorage.setItem('dd_config', JSON.stringify(config));
  }, [config]);

  // New useEffect to check if welcome modal should be shown
  useEffect(() => {
    const seen = localStorage.getItem('dd-events-ui-welcome-seen');
    if (!seen) {
      setIsWelcomeOpen(true);
    }
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      footer={{ height: 40 }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }}>
              <IconActivity size={20} />
            </ThemeIcon>
            <Title order={3}>Datadog Events UI</Title>
          </Group>

          <Group>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
              <Tabs.List>
                <Tabs.Tab value="create" leftSection={<IconPlus size={16} />}>
                  Create
                </Tabs.Tab>
                <Tabs.Tab value="list" leftSection={<IconActivity size={16} />}>
                  Stream
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Group>

          <Group>
            {/* New Help button */}
            <Tooltip label="Help & Info">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setIsWelcomeOpen(true)}
                title="Help & Info"
              >
                <IconHelp size={20} />
              </ActionIcon>
            </Tooltip>

            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => setIsConfigOpen(true)}
              title="Configuration"
            >
              <IconSettings size={20} />
            </ActionIcon>
            <Indicator disabled={requestCount === 0} color={errorCount > 0 ? 'red' : 'blue'} size={8} offset={4}>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setIsInspectorOpen(true)}
                title="Request Inspector"
              >
                <IconServer size={20} />
              </ActionIcon>
            </Indicator>
            {/* Replaced ThemeToggle with ActionIcon for consistency with the provided edit */}
            <ActionIcon variant="subtle" size="lg" onClick={() => toggleColorScheme()} title="Toggle color scheme">
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>


      <AppShell.Main h="calc(100vh - 100px)" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'create' ? (
            <Grid h="100%" gutter={0} style={{ flex: 1 }}>
              <Grid.Col span={{ base: 12, md: 7 }} p="md" style={{ height: '100%', overflowY: 'auto' }}>
                <CreateEventForm config={config} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 5 }} h="100%" style={{ height: '100%', overflow: 'hidden' }}>
                <DebugPanel />
              </Grid.Col>
            </Grid>
          ) : (
            <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--mantine-spacing-md)' }}>
              <EventList config={config} />
            </div>
          )}
        </div>
      </AppShell.Main>

      <AppShell.Footer p={0} zIndex={100}>
        <Footer />
      </AppShell.Footer>

      <ConfigPanel
        config={config}
        onConfigChange={setConfig}
        opened={isConfigOpen}
        open={() => setIsConfigOpen(true)}
        close={() => setIsConfigOpen(false)}
      />

      <RequestInspector
        opened={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      <WelcomeModal
        opened={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />
    </AppShell>
  );
}

export default App;
