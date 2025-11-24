import React from 'react';
import { Modal, TextInput, Select, Button, Stack } from '@mantine/core';
import { SITES } from '../lib/api';

export function ConfigPanel({ config, onConfigChange, opened, close }) {
    const handleChange = (field, value) => {
        onConfigChange({ ...config, [field]: value });
    };

    return (
        <Modal opened={opened} onClose={close} title="Configuration" centered>
            <form onSubmit={(e) => { e.preventDefault(); close(); }}>
                <Stack>
                    <Select
                        label="Datadog Site"
                        data={SITES}
                        value={config.site}
                        onChange={(value) => handleChange('site', value)}
                    />

                    <TextInput
                        label="API Key"
                        type="password"
                        placeholder="Enter your API Key"
                        value={config.apiKey}
                        onChange={(e) => handleChange('apiKey', e.target.value)}
                    />

                    <TextInput
                        label="Application Key"
                        type="password"
                        placeholder="Enter your Application Key"
                        value={config.appKey}
                        onChange={(e) => handleChange('appKey', e.target.value)}
                    />

                    <Button type="submit" fullWidth mt="md">
                        Done
                    </Button>

                    <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => {
                            onConfigChange({ ...config, apiKey: '', appKey: '' });
                        }}
                    >
                        Clear Data
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
