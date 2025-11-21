import React, { useState, useEffect } from 'react';
import { listEvents } from '../lib/api';
import { TextInput, Card, Text, Badge, Group, ActionIcon, Stack, Drawer, Code, Button, Center, Loader, Select } from '@mantine/core';
import { IconSearch, IconRefresh, IconClock, IconX, IconExternalLink } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';

const TIME_RANGES = [
    { value: '900000', label: 'Past 15 minutes' },
    { value: '3600000', label: 'Past 1 hour' },
    { value: '14400000', label: 'Past 4 hours' },
    { value: '86400000', label: 'Past 1 day' },
    { value: '172800000', label: 'Past 2 days' },
    { value: '604800000', label: 'Past 1 week' },
];

export function EventList({ config }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [timeRange, setTimeRange] = useState('3600000'); // Default 1 hour
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = async (cursor = null) => {
        if (!config.apiKey || !config.appKey) {
            setError('Please configure API keys first.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const now = Date.now();
            const fromTime = now - parseInt(timeRange);

            const params = {
                'filter[query]': query,
                'filter[from]': fromTime,
                'filter[to]': now,
                'page[limit]': 10,
            };
            if (cursor) {
                params['page[cursor]'] = cursor;
            }

            const data = await listEvents(config, params);
            setEvents(data.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch events. Check your API keys and network connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (config.apiKey && config.appKey) {
            fetchEvents();
        }
    }, [config.apiKey, config.appKey, timeRange]); // Refetch when time range changes

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents();
    };

    const getBadgeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'error': return 'red';
            case 'warning': return 'yellow';
            case 'success': return 'green';
            case 'info': return 'blue';
            default: return 'gray';
        }
    };

    // Helper to extract event data handling nested attributes
    const getEventData = (event) => {
        const attrs = event.attributes || {};
        const nestedAttrs = attrs.attributes || {};

        return {
            title: nestedAttrs.title || attrs.title || 'Untitled Event',
            message: nestedAttrs.message || nestedAttrs.text || attrs.text || attrs.message || '',
            status: nestedAttrs.status || attrs.status || attrs.alert_type || 'info',
            timestamp: nestedAttrs.timestamp || attrs.timestamp,
            tags: nestedAttrs.tags || attrs.tags || [],
            raw: event
        };
    };

    const selectedEventData = selectedEvent ? getEventData(selectedEvent) : null;

    return (
        <Stack h="100%">
            <form onSubmit={handleSearch}>
                <Group>
                    <TextInput
                        placeholder="Search events (e.g. status:error service:web)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ flex: 1 }}
                        leftSection={<IconSearch size={16} />}
                    />
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        data={TIME_RANGES}
                        w={160}
                        allowDeselect={false}
                    />
                    <ActionIcon size="lg" variant="light" onClick={() => fetchEvents()} loading={loading}>
                        <IconRefresh size={20} />
                    </ActionIcon>
                </Group>
            </form>

            {error && (
                <Card withBorder c="red" bg="red.0">
                    <Text size="sm">{error}</Text>
                </Card>
            )}

            <Stack gap="sm">
                {loading && events.length === 0 ? (
                    <Center py="xl">
                        <Loader />
                    </Center>
                ) : events.length === 0 && !error ? (
                    <Center py="xl">
                        <Text c="dimmed">No events found.</Text>
                    </Center>
                ) : (
                    events.map((event) => {
                        const data = getEventData(event);
                        return (
                            <Card
                                key={event.id}
                                withBorder
                                padding="sm"
                                radius="md"
                                component="button"
                                onClick={() => setSelectedEvent(event)}
                                className="hover:border-indigo-500 transition-colors text-left w-full"
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text fw={500} lineClamp={1}>{data.title}</Text>
                                    <Badge color={getBadgeColor(data.status)} variant="light">
                                        {data.status}
                                    </Badge>
                                </Group>

                                <Text size="sm" c="dimmed" lineClamp={2} mb="xs">
                                    {data.message}
                                </Text>

                                <Group gap="xs">
                                    <Group gap={4}>
                                        <IconClock size={14} className="text-gray-500" />
                                        <Text size="xs" c="dimmed">
                                            {new Date(data.timestamp).toLocaleString()}
                                        </Text>
                                    </Group>
                                    {data.tags?.slice(0, 3).map((tag, i) => (
                                        <Badge key={i} size="xs" variant="outline" color="gray">
                                            {tag}
                                        </Badge>
                                    ))}
                                </Group>
                            </Card>
                        );
                    })
                )}
            </Stack>

            <Drawer
                opened={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title={selectedEventData?.title}
                position="right"
                size="xl"
                padding="xl"
            >
                {selectedEventData && (
                    <Stack>
                        <Group>
                            <Badge color={getBadgeColor(selectedEventData.status)}>
                                {selectedEventData.status}
                            </Badge>
                            <Text size="sm" c="dimmed">
                                {new Date(selectedEventData.timestamp).toLocaleString()}
                            </Text>
                        </Group>

                        <Card withBorder radius="md" p="md">
                            <div className="markdown-content">
                                <ReactMarkdown>
                                    {selectedEventData.message}
                                </ReactMarkdown>
                            </div>
                        </Card>

                        <Card withBorder bg="gray.0">
                            <Code block>{JSON.stringify(selectedEventData.raw, null, 2)}</Code>
                            <Group justify="flex-end" mt="xl">
                                <Button
                                    component="a"
                                    href={`https://${config.site}/event/explorer?event=${selectedEvent.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="light"
                                    rightSection={<IconExternalLink size={14} />}
                                >
                                    Open in Datadog
                                </Button>
                            </Group>
                        </Card>
                    </Stack>
                )}
            </Drawer>
        </Stack>
    );
}
