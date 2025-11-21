import axios from 'axios';
import { useRequestStore } from './store';

export const SITES = [
    { value: 'datadoghq.com', label: 'US1 (datadoghq.com)' },
    { value: 'us3.datadoghq.com', label: 'US3 (us3.datadoghq.com)' },
    { value: 'us5.datadoghq.com', label: 'US5 (us5.datadoghq.com)' },
    { value: 'ap1.datadoghq.com', label: 'AP1 (ap1.datadoghq.com)' },
    { value: 'datadoghq.eu', label: 'EU (datadoghq.eu)' },
    { value: 'ddog-gov.com', label: 'US1-FED (ddog-gov.com)' },
];

const getBaseUrl = (site, type = 'api') => {
    // Use proxy in development to avoid CORS
    if (import.meta.env.DEV) {
        return `/proxy/${site}/${type}/api/v2/events`;
    }

    if (type === 'intake') {
        return `https://event-management-intake.${site}/api/v2/events`;
    }
    return `https://api.${site}/api/v2/events`;
};

// Create axios instance
const api = axios.create();

// Request interceptor
api.interceptors.request.use((config) => {
    const id = Math.random().toString(36).substring(7);
    config.metadata = { id, startTime: Date.now() };

    useRequestStore.getState().addRequest({
        id,
        method: config.method.toUpperCase(),
        url: config.url,
        headers: config.headers,
        body: config.data,
        startTime: Date.now(),
        status: 'pending',
    });

    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        const { id, startTime } = response.config.metadata;
        const duration = Date.now() - startTime;

        useRequestStore.getState().updateRequest(id, {
            status: response.status,
            responseHeaders: response.headers,
            responseBody: response.data,
            duration,
            endTime: Date.now(),
        });

        return response;
    },
    (error) => {
        const { id, startTime } = error.config?.metadata || {};
        const duration = startTime ? Date.now() - startTime : 0;

        // Extract detailed error message
        let errorMessage = error.message;
        let errorDetails = error.response?.data;

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            if (data && data.errors && data.errors[0] && data.errors[0].detail) {
                errorMessage = `${status} Error: ${data.errors[0].detail}`;
            } else if (data && data.message) {
                errorMessage = `${status} Error: ${data.message}`;
            } else {
                errorMessage = `${status} ${error.response.statusText || 'Error'}`;
            }
        } else if (error.request) {
            errorMessage = "Network Error: No response received from server. Check CORS or network connection.";
        }

        if (id) {
            useRequestStore.getState().updateRequest(id, {
                status: error.response?.status || 'Error',
                responseBody: errorDetails || errorMessage,
                duration,
                endTime: Date.now(),
                error: true,
            });
        }

        useRequestStore.getState().addError({
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            message: errorMessage,
            details: errorDetails,
            status: error.response?.status,
        });

        // Return a rejected promise with the enhanced message so UI components can display it
        const enhancedError = new Error(errorMessage);
        enhancedError.response = error.response;
        enhancedError.originalError = error;
        return Promise.reject(enhancedError);
    }
);

export const createEvent = async (config, eventData) => {
    const { apiKey, appKey, site } = config;
    const url = getBaseUrl(site, 'intake');

    const response = await api.post(url, { data: eventData }, {
        headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const listEvents = async (config, params = {}) => {
    const { apiKey, appKey, site } = config;
    const url = getBaseUrl(site, 'api');

    const response = await api.get(url, {
        headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
            'Content-Type': 'application/json',
        },
        params,
    });
    return response.data;
};

export const getEvent = async (config, eventId) => {
    const { apiKey, appKey, site } = config;
    const url = `${getBaseUrl(site, 'api')}/${eventId}`;

    const response = await api.get(url, {
        headers: {
            'DD-API-KEY': apiKey,
            'DD-APPLICATION-KEY': appKey,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};
