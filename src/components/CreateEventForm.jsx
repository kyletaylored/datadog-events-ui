import React, { useState } from 'react';
import { createEvent } from '../lib/api';
import { TextInput, Textarea, Select, Button, Stack, Group, Card, Text, SimpleGrid, Badge, TagsInput, SegmentedControl, JsonInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

const TEMPLATES = [
    {
        name: 'Deployment Success',
        type: 'alert',
        data: {
            title: 'Deployment Successful: v1.2.3',
            text: 'The deployment to production was successful.',
            priority: '3', // Normal
            alert_type: 'success',
            tags: ['env:prod', 'service:web-app', 'version:v1.2.3'],
        },
    },
    {
        name: 'Error Alert',
        type: 'alert',
        data: {
            title: 'High Error Rate Detected',
            text: 'Error rate exceeded 5% in the last 5 minutes.',
            priority: '1', // High/Critical
            alert_type: 'error',
            tags: ['env:prod', 'service:payment-api', 'severity:high'],
        },
    },
    {
        name: 'Feature Flag Update',
        type: 'change',
        data: {
            title: 'Feature Flag Updated: payment_processed',
            text: 'payment_processed feature flag has been enabled',
            tags: ['env:prod', 'team:payments'],
            changed_resource_name: 'payment_processed',
            changed_resource_type: 'feature_flag',
            new_value: '{\n  "enabled": true,\n  "percentage": 50\n}',
            prev_value: '{\n  "enabled": false\n}'
        }
    },
    {
        name: 'Config Change',
        type: 'change',
        data: {
            title: 'Database Config Changed',
            text: 'Increased max_connections from 100 to 200',
            tags: ['env:prod', 'service:db'],
            changed_resource_name: 'postgres.conf',
            changed_resource_type: 'configuration',
            new_value: '{\n  "max_connections": 200\n}',
            prev_value: '{\n  "max_connections": 100\n}'
        }
    }
];

export function CreateEventForm({ config }) {
    const [category, setCategory] = useState('alert');
    const [formData, setFormData] = useState({
        title: '',
        text: '',
        priority: '3',
        alert_type: 'info',
        tags: [],
        // Change specific
        changed_resource_name: '',
        changed_resource_type: '',
        new_value: '',
        prev_value: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const applyTemplate = (template) => {
        setCategory(template.type);
        setFormData((prev) => ({
            ...prev,
            ...template.data,
            tags: template.data.tags,
        }));
        notifications.show({
            title: 'Template Applied',
            message: `Applied ${template.name} template`,
            color: 'blue',
        });
    };

    const tryParseJson = (str) => {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            return str; // Return as string if not valid JSON
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!config.apiKey || !config.appKey) {
            notifications.show({
                title: 'Configuration Error',
                message: 'Please configure API keys first.',
                color: 'red',
                icon: <IconX size={18} />,
            });
            return;
        }

        setLoading(true);

        try {
            let payload;

            if (category === 'alert') {
                // Map alert_type to status (ok, warn, error)
                const mapStatus = (type) => {
                    switch (type) {
                        case 'warning': return 'warn';
                        case 'error': return 'error';
                        case 'success': return 'ok';
                        case 'info': return 'ok';
                        default: return 'ok';
                    }
                };

                payload = {
                    type: 'event',
                    attributes: {
                        title: formData.title,
                        message: formData.text,
                        tags: formData.tags,
                        category: 'alert',
                        integration_id: 'custom-events',
                        attributes: {
                            priority: formData.priority,
                            status: mapStatus(formData.alert_type),
                        }
                    }
                };
            } else {
                // Change Event
                payload = {
                    type: 'event',
                    attributes: {
                        title: formData.title,
                        message: formData.text,
                        tags: formData.tags,
                        category: 'change',
                        integration_id: 'custom-events',
                        attributes: {
                            changed_resource: {
                                name: formData.changed_resource_name,
                                type: formData.changed_resource_type
                            },
                            new_value: tryParseJson(formData.new_value),
                            prev_value: tryParseJson(formData.prev_value),
                        }
                    }
                };
            }

            await createEvent(config, payload);
            notifications.show({
                title: 'Success',
                message: 'Event created successfully!',
                color: 'green',
                icon: <IconCheck size={18} />,
            });

            // Reset form but keep category
            setFormData(prev => ({
                ...prev,
                title: '',
                text: '',
                priority: '3',
                alert_type: 'info',
                tags: [],
                changed_resource_name: '',
                changed_resource_type: '',
                new_value: '',
                prev_value: '',
            }));
        } catch (error) {
            console.error(error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.errors?.[0]?.detail || error.message || 'Failed to create event.',
                color: 'red',
                icon: <IconX size={18} />,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack maw={800} mx="auto" gap="xl">
            <div>
                <Text size="sm" fw={500} c="dimmed" mb="sm" tt="uppercase">
                    Quick Templates
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                    {TEMPLATES.map((template) => (
                        <Card
                            key={template.name}
                            withBorder
                            padding="sm"
                            radius="md"
                            component="button"
                            onClick={() => applyTemplate(template)}
                            className="hover:border-indigo-500 transition-colors text-left"
                        >
                            <Group gap="xs" mb={4}>
                                <Badge size="xs" variant="light" color={template.type === 'alert' ? 'blue' : 'orange'}>
                                    {template.type}
                                </Badge>
                            </Group>
                            <Text fw={500} size="sm" lineClamp={1}>{template.name}</Text>
                        </Card>
                    ))}
                </SimpleGrid>
            </div>

            <Card withBorder radius="md" p="xl">
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <SegmentedControl
                            value={category}
                            onChange={setCategory}
                            data={[
                                { label: 'Alert Event', value: 'alert' },
                                { label: 'Change Event', value: 'change' },
                            ]}
                            fullWidth
                            mb="sm"
                        />

                        <TextInput
                            label="Event Title"
                            required
                            placeholder={category === 'alert' ? "e.g., Deployment Started" : "e.g., Feature Flag Updated"}
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />

                        <Textarea
                            label="Message Body"
                            required
                            placeholder="Describe the event..."
                            minRows={3}
                            value={formData.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                        />

                        {category === 'alert' ? (
                            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                <Select
                                    label="Alert Type"
                                    data={[
                                        { value: 'info', label: 'Info' },
                                        { value: 'success', label: 'Success' },
                                        { value: 'warning', label: 'Warning' },
                                        { value: 'error', label: 'Error' },
                                    ]}
                                    value={formData.alert_type}
                                    onChange={(value) => handleChange('alert_type', value)}
                                />

                                <Select
                                    label="Priority"
                                    data={[
                                        { value: '1', label: 'P1 (Critical)' },
                                        { value: '2', label: 'P2 (High)' },
                                        { value: '3', label: 'P3 (Normal)' },
                                        { value: '4', label: 'P4 (Low)' },
                                        { value: '5', label: 'P5 (Info)' },
                                    ]}
                                    value={formData.priority}
                                    onChange={(value) => handleChange('priority', value)}
                                />
                            </SimpleGrid>
                        ) : (
                            <>
                                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                    <TextInput
                                        label="Changed Resource Name"
                                        placeholder="e.g., my-feature-flag"
                                        required
                                        value={formData.changed_resource_name}
                                        onChange={(e) => handleChange('changed_resource_name', e.target.value)}
                                    />
                                    <TextInput
                                        label="Changed Resource Type"
                                        placeholder="e.g., feature_flag"
                                        required
                                        value={formData.changed_resource_type}
                                        onChange={(e) => handleChange('changed_resource_type', e.target.value)}
                                    />
                                </SimpleGrid>
                                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                    <JsonInput
                                        label="New Value (JSON)"
                                        placeholder='{"enabled": true}'
                                        minRows={4}
                                        value={formData.new_value}
                                        onChange={(value) => handleChange('new_value', value)}
                                    />
                                    <JsonInput
                                        label="Previous Value (JSON)"
                                        placeholder='{"enabled": false}'
                                        minRows={4}
                                        value={formData.prev_value}
                                        onChange={(value) => handleChange('prev_value', value)}
                                    />
                                </SimpleGrid>
                            </>
                        )}

                        <TagsInput
                            label="Tags"
                            placeholder="Enter tags and press Enter"
                            value={formData.tags}
                            onChange={(value) => handleChange('tags', value)}
                            clearable
                        />

                        <Button type="submit" loading={loading} mt="md">
                            Create {category === 'alert' ? 'Alert' : 'Change'} Event
                        </Button>
                    </Stack>
                </form>
            </Card>
        </Stack>
    );
}
