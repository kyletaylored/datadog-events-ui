import React from 'react';
import { Group, Text, Anchor, Box } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';

export function Footer() {
    return (
        <Box
            component="footer"
            py="xs"
            px="md"
            className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
        >
            <Group justify="space-between" gap="xs">
                <Text size="xs" c="dimmed">
                    &copy; {new Date().getFullYear()} Kyle Taylor. All rights reserved.
                </Text>

                <Group gap="lg">
                    <Text size="xs" c="dimmed">
                        Not endorsed or supported by Datadog.
                    </Text>
                    <Anchor
                        href="https://github.com/kyletaylored/datadog-events-ui"
                        target="_blank"
                        rel="noopener noreferrer"
                        c="dimmed"
                        size="xs"
                        display="flex"
                        style={{ alignItems: 'center', gap: '4px' }}
                    >
                        <IconBrandGithub size={14} />
                        GitHub
                    </Anchor>
                </Group>
            </Group>
        </Box>
    );
}
