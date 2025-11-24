/**
 * Cloudflare Worker Proxy for Datadog Events API
 * 
 * Usage:
 * POST https://your-worker.subdomain.workers.dev/?url=<datadog_api_url>
 * Headers: DD-API-KEY, DD-APPLICATION-KEY, Content-Type
 * Body: JSON payload
 */

export default {
    async fetch(request, env, ctx) {
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, DD-API-KEY, DD-APPLICATION-KEY',
        };

        // Handle preflight OPTIONS request
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders,
            });
        }

        const url = new URL(request.url);
        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return new Response(JSON.stringify({ error: 'Missing "url" query parameter' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Validate URL (security check)
        try {
            const parsedUrl = new URL(targetUrl);
            const allowedDomains = ['.datadoghq.com', '.datadoghq.eu', '.ddog-gov.com'];
            const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));

            if (!isAllowed) {
                return new Response(JSON.stringify({ error: 'Invalid target domain. Only Datadog domains are allowed.' }), {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Prepare request to Datadog
        const newRequestInit = {
            method: request.method,
            headers: new Headers(request.headers),
            body: request.body,
        };

        // Ensure we don't pass host header which might confuse the target
        newRequestInit.headers.delete('Host');

        try {
            const response = await fetch(targetUrl, newRequestInit);

            // Create new response with CORS headers
            const newResponse = new Response(response.body, response);
            Object.keys(corsHeaders).forEach(key => {
                newResponse.headers.set(key, corsHeaders[key]);
            });

            return newResponse;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Proxy error: ' + e.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
    },
};
