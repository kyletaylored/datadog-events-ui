import React, { useState } from 'react';
import { Card, Text, Code, Badge, Stack, Group, ScrollArea, Title, Box, Center, Tabs, Table, Button, Collapse } from '@mantine/core';
import { useRequestStore } from '../lib/store';
import { IconActivity, IconArrowRight, IconServer, IconUpload, IconDownload, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

export function DebugPanel() {
    const latestRequest = useRequestStore((state) => state.requests[0]);
    const [activeTab, setActiveTab] = useState('request');

    if (!latestRequest) {
        return (
            <Center h="100%" p="xl" className="border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <Stack align="center" c="dimmed">
                    <IconActivity size={48} stroke={1.5} />
                    <Text ta="center">Make a request to see debug info here</Text>
                </Stack>
            </Center>
        );
    }

    const getStatusColor = (status) => {
        if (status === 'pending') return 'blue';
        if (status >= 200 && status < 300) return 'green';
        if (status >= 400) return 'red';
        return 'gray';
    };

    const getRealUrl = (url) => {
        if (!url) return '';
        // Handle proxy URLs in development
        if (url.startsWith('/proxy/')) {
            const parts = url.split('/');
            // /proxy/site/type/... -> https://{type-prefix}.{site}/...
            // parts[0] = ""
            // parts[1] = "proxy"
            // parts[2] = site (e.g. datadoghq.com)
            // parts[3] = type (api or intake)
            // parts[4+] = rest of path

            const site = parts[2];
            const type = parts[3];
            const path = parts.slice(4).join('/');

            if (type === 'intake') {
                return `https://event-management-intake.${site}/${path}`;
            }
            return `https://api.${site}/${path}`;
        }
        return url;
    };

    const [headersOpen, setHeadersOpen] = useState(false);

    const renderHeaders = (headers) => {
        if (!headers) return <Text c="dimmed" size="sm">No headers recorded</Text>;

        return (
            <Box>
                <Button
                    variant="subtle"
                    size="xs"
                    compact
                    onClick={() => setHeadersOpen(!headersOpen)}
                    leftSection={headersOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    color="gray"
                    mb="xs"
                >
                    {headersOpen ? 'Hide Headers' : 'Show Headers'}
                </Button>
                <Collapse in={headersOpen}>
                    <Table size="xs" striped withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Header</Table.Th>
                                <Table.Th>Value</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {Object.entries(headers).map(([key, value]) => {
                                const isSecret = ['DD-API-KEY', 'DD-APPLICATION-KEY'].includes(key.toUpperCase());
                                return (
                                    <Table.Tr key={key}>
                                        <Table.Td style={{ wordBreak: 'break-all', width: '40%' }}>{key}</Table.Td>
                                        <Table.Td style={{ wordBreak: 'break-all' }}>
                                            {isSecret ? '•'.repeat(20) : value}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Collapse>
            </Box>
        );
    };

    return (
        <Stack h="100%" gap={0} className="border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <Box p="md" className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Group justify="space-between">
                    <Group gap="xs">
                        <IconServer size={20} />
                        <Title order={5}>Debug Console</Title>
                    </Group>
                    <Badge variant="dot" color={getStatusColor(latestRequest.status)}>
                        {latestRequest.status === 'pending' ? 'Sending...' : latestRequest.status}
                    </Badge>
                </Group>
            </Box>

            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius={0} flex={1} display="flex" style={{ flexDirection: 'column' }}>
                <Tabs.List grow className="bg-white dark:bg-gray-900">
                    <Tabs.Tab value="request" leftSection={<IconUpload size={14} />}>
                        Request
                    </Tabs.Tab>
                    <Tabs.Tab value="response" leftSection={<IconDownload size={14} />}>
                        Response
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="request" flex={1} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ScrollArea h="100%" p="md">
                        <Stack gap="lg">
                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Endpoint</Text>
                                <Group align="flex-start" wrap="nowrap">
                                    <Badge size="lg">{latestRequest.method}</Badge>
                                    <Code style={{ flex: 1, wordBreak: 'break-all' }}>
                                        {getRealUrl(latestRequest.url)}
                                    </Code>
                                </Group>
                            </Box>

                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Headers</Text>
                                {renderHeaders(latestRequest.headers)}
                            </Box>

                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Body</Text>
                                {latestRequest.body ? (
                                    <ScrollArea.Autosize maxHeight={300}>
                                        <Code block>{JSON.stringify(latestRequest.body, null, 2)}</Code>
                                    </ScrollArea.Autosize>
                                ) : (
                                    <Text c="dimmed" size="sm">No body</Text>
                                )}
                            </Box>
                        </Stack>
                    </ScrollArea>
                </Tabs.Panel>

                <Tabs.Panel value="response" flex={1} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <ScrollArea h="100%" p="md">
                        <Stack gap="lg">
                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Status</Text>
                                <Group>
                                    <Badge size="lg" color={getStatusColor(latestRequest.status)}>
                                        {latestRequest.status}
                                    </Badge>
                                    {latestRequest.duration && (
                                        <Text size="sm" c="dimmed">{latestRequest.duration} ms</Text>
                                    )}
                                </Group>
                            </Box>

                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Headers</Text>
                                {renderHeaders(latestRequest.responseHeaders)}
                            </Box>

                            <Box>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Body</Text>
                                {latestRequest.status === 'pending' ? (
                                    <Text c="dimmed" fs="italic">Waiting for response...</Text>
                                ) : latestRequest.responseBody ? (
                                    <ScrollArea.Autosize maxHeight={400}>
                                        <Code block color={latestRequest.error ? 'red' : 'blue'}>
                                            {typeof latestRequest.responseBody === 'object'
                                                ? JSON.stringify(latestRequest.responseBody, null, 2)
                                                : latestRequest.responseBody}
                                        </Code>
                                    </ScrollArea.Autosize>
                                ) : (
                                    <Text c="dimmed" size="sm">No response body</Text>
                                )}
                            </Box>
                        </Stack>
                    </ScrollArea>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}
