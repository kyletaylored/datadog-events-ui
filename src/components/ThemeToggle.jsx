import React from 'react';
import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ThemeToggle() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    return (
        <ActionIcon
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
        >
            <IconSun className={computedColorScheme === 'dark' ? 'hidden' : 'block'} size={20} />
            <IconMoon className={computedColorScheme === 'light' ? 'hidden' : 'block'} size={20} />
        </ActionIcon>
    );
}
