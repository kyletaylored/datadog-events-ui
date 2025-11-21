import React, { useEffect, useState } from 'react';
import { Modal, Text, Button, Stack, Title, List, ThemeIcon, Group, Checkbox } from '@mantine/core';
import { IconInfoCircle, IconCheck, IconKey, IconSend } from '@tabler/icons-react';

export function WelcomeModal({ opened, onClose }) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('dd-events-ui-welcome-seen', 'true');
        }
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={<Text fw={700} size="lg">Welcome to Datadog Event Management UI</Text>}
            size="lg"
            padding="xl"
        >
            <Stack gap="lg">
                <Text size="sm" c="dimmed">
                    This tool allows you to easily create and manage Datadog Events via the API, directly from your browser.
                </Text>

                <Stack gap="md">
                    <Title order={5}>Quick Start Guide</Title>
                    <List
                        spacing="sm"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon color="blue" size={24} radius="xl">
                                <IconCheck size={16} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>
                            <Group gap="xs">
                                <IconKey size={16} />
                                <Text>Configure your <b>API Key</b> and <b>Application Key</b> in Settings.</Text>
                            </Group>
                        </List.Item>
                        <List.Item>
                            <Group gap="xs">
                                <IconSend size={16} />
                                <Text>Use the <b>Create</b> tab to send Alert or Change events.</Text>
                            </Group>
                        </List.Item>
                        <List.Item>
                            <Group gap="xs">
                                <IconInfoCircle size={16} />
                                <Text>View responses in the <b>Debug Console</b> or <b>Request Inspector</b>.</Text>
                            </Group>
                        </List.Item>
                    </List>
                </Stack>

                <Stack gap="xs" className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                    <Title order={6} c="red.7">Disclaimer</Title>
                    <Text size="xs" c="dimmed">
                        This application is a personal project by Kyle Taylor (Senior Sales Engineer at Datadog) and is <b>not officially endorsed, supported, or maintained by Datadog</b>.
                    </Text>
                    <Text size="xs" c="dimmed">
                        The software is provided "as-is", without warranty of any kind. No data is collected, tracked, or sent to any third-party servers by this application itself; all API requests are made directly from your browser to Datadog.
                    </Text>
                </Stack>

                <Group justify="space-between" mt="md">
                    <Checkbox
                        label="Don't show this again"
                        checked={dontShowAgain}
                        onChange={(event) => setDontShowAgain(event.currentTarget.checked)}
                    />
                    <Button onClick={handleClose}>Get Started</Button>
                </Group>
            </Stack>
        </Modal>
    );
}
