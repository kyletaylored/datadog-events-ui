import React, { useState } from 'react';
import { Drawer, Tabs, ScrollArea, Text, Badge, Group, Code, Stack, ActionIcon, JsonInput, Box } from '@mantine/core';
import { useRequestStore } from '../lib/store';
import { IconTrash, IconAlertCircle, IconExchange, IconArrowRight } from '@tabler/icons-react';

export function RequestInspector({ opened, onClose }) {
    const { requests, errors, clearRequests, clearErrors } = useRequestStore();
    const [activeTab, setActiveTab] = useState('history');
    const [selectedItem, setSelectedItem] = useState(null);

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'green';
        if (status >= 400) return 'red';
        return 'gray';
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title="Request Inspector"
            position="right"
            size="xl"
            padding="md"
        >
            <Tabs value={activeTab} onChange={setActiveTab} h="100%">
                <Tabs.List>
                    <Tabs.Tab value="history" leftSection={<IconExchange size={16} />}>
                        History
                    </Tabs.Tab>
                    <Tabs.Tab value="errors" leftSection={<IconAlertCircle size={16} />}>
                        Errors ({errors.length})
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="history" h="calc(100vh - 120px)">
                    <Stack h="100%" gap="md" pt="md">
                        <Group justify="flex-end">
                            <ActionIcon variant="light" color="red" onClick={clearRequests} title="Clear History">
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>

                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {selectedItem ? (
                                <Stack h="100%" className="overflow-y-auto">
                                    <Button variant="subtle" size="xs" onClick={() => setSelectedItem(null)} compact>
                                        ← Back to List
                                    </Button>

                                    <Box>
                                        <Text fw={700} size="sm">Request</Text>
                                        <Group mb="xs">
                                            <Badge>{selectedItem.method}</Badge>
                                            <Code>{selectedItem.url.replace(/^\/proxy\/[^/]+\/[^/]+\//, 'https://api.datadoghq.com/')}</Code>
                                        </Group>
                                        {selectedItem.body && (
                                            <Code block>{JSON.stringify(selectedItem.body, null, 2)}</Code>
                                        )}
                                    </Box>

                                    <Box>
                                        <Text fw={700} size="sm">Response ({selectedItem.duration} ms)</Text>
                                        <Badge color={getStatusColor(selectedItem.status)} mb="xs">
                                            {selectedItem.status}
                                        </Badge>
                                        {selectedItem.responseBody && (
                                            <Code block>{JSON.stringify(selectedItem.responseBody, null, 2)}</Code>
                                        )}
                                    </Box>
                                </Stack>
                            ) : (
                                <ScrollArea h="100%">
                                    <Stack gap="sm">
                                        {requests.map((req) => (
                                            <Box
                                                key={req.id}
                                                p="sm"
                                                className="border border-gray-200 dark:border-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                                                onClick={() => setSelectedItem(req)}
                                            >
                                                <Group justify="space-between" mb={4}>
                                                    <Badge size="sm" variant="light">{req.method}</Badge>
                                                    <Badge size="sm" color={getStatusColor(req.status)}>
                                                        {req.status}
                                                    </Badge>
                                                </Group>
                                                <Text size="xs" lineClamp={1} c="dimmed" style={{ wordBreak: 'break-all' }}>
                                                    {req.url.replace(/^\/proxy\/[^/]+\/[^/]+\//, 'https://api.datadoghq.com/')}
                                                </Text>
                                                <Text size="xs" c="dimmed" mt={4}>
                                                    {new Date(req.startTime).toLocaleTimeString()} • {req.duration ? `${req.duration} ms` : 'Pending...'}
                                                </Text>
                                            </Box>
                                        ))}
                                        {requests.length === 0 && (
                                            <Text c="dimmed" ta="center" py="xl">No requests yet</Text>
                                        )}
                                    </Stack>
                                </ScrollArea>
                            )}
                        </div>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="errors" h="calc(100vh - 120px)">
                    <Stack h="100%" gap="md" pt="md">
                        <Group justify="flex-end">
                            <ActionIcon variant="light" color="red" onClick={clearErrors} title="Clear Errors">
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>

                        <ScrollArea h="100%">
                            <Stack gap="sm">
                                {errors.map((err) => (
                                    <Box
                                        key={err.id}
                                        p="sm"
                                        className="border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900 rounded cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group"
                                        onClick={() => {
                                            // Find the request associated with this error if possible, or just show details
                                            // For now, we can just show the error details in a modal or expand it
                                            // But the user asked for affordance, so let's make it look clickable and maybe expand
                                            setSelectedItem({
                                                status: err.status || 'Error',
                                                responseBody: err.details || err.message,
                                                duration: 0, // We might not have duration here easily without linking back
                                                error: true,
                                                method: 'ERROR',
                                                url: 'See details below'
                                            });
                                        }}
                                    >
                                        <Group justify="space-between" mb={4}>
                                            <Group gap="xs">
                                                <IconAlertCircle size={16} className="text-red-600" />
                                                <Text fw={500} size="sm" c="red">Error {err.status}</Text>
                                            </Group>
                                            <Group gap="xs">
                                                <Text size="xs" c="dimmed">
                                                    {new Date(err.timestamp).toLocaleTimeString()}
                                                </Text>
                                                <IconArrowRight size={14} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Group>
                                        </Group>
                                        <Text size="sm" mb="xs" lineClamp={2}>{err.message}</Text>
                                    </Box>
                                ))}
                                {errors.length === 0 && (
                                    <Text c="dimmed" ta="center" py="xl">No errors logged</Text>
                                )}
                            </Stack>
                        </ScrollArea>
                    </Stack>
                </Tabs.Panel>
            </Tabs>
        </Drawer>
    );
}

// Helper Button component for internal use
import { Button } from '@mantine/core';
