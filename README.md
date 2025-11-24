# Datadog Events UI

A modern, client-side interface for managing Datadog Events. This tool allows you to easily create, view, and debug Datadog events (both Alerts and Changes) directly from your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Datadog](https://img.shields.io/badge/Datadog-API%20v2-purple.svg)

## Features

*   **Event Creation**:
    *   Support for **Alert** and **Change** event types.
    *   **Templates**: Quick-start templates for common scenarios (Deployments, Errors, Warnings).
    *   **JSON Input**: Advanced JSON editor for custom payload attributes.
*   **Event Stream**:
    *   View recent events with filtering by time range and search query.
    *   Markdown rendering for event text.
    *   Direct links to open events in the Datadog Event Explorer.
*   **Debug Panel**:
    *   Real-time inspection of API requests and responses.
    *   Collapsible headers and formatted JSON bodies.
    *   **Request Inspector**: History of all API calls with success/error status.
*   **User Experience**:
    *   **Dark/Light Mode**: Fully responsive theme.
    *   **Local Storage**: API keys and preferences are saved locally in your browser.
    *   **Secure**: Client-side only; your keys never leave your browser except to go to Datadog.

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm (v9 or later)
*   A Datadog Account with an API Key and Application Key.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/kyletaylored/datadog-events-ui.git
    cd datadog-events-ui
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser to `http://localhost:5173`.

### Configuration

1.  Click the **Settings** (gear) icon in the top navigation.
2.  Select your **Datadog Site** (e.g., `datadoghq.com` for US1).
3.  Enter your **API Key** and **Application Key**.
4.  Click **Done**.

> **Note**: Keys are stored in your browser's `localStorage`. You can clear them at any time using the "Clear Data" button in the settings panel.

## CORS & Proxy Setup

The Datadog API does not support direct browser requests (CORS) when using API keys. This application is configured to use a Cloudflare Worker proxy (`https://dd-events.kyletaylored.workers.dev/`) to securely forward requests to Datadog.

No additional configuration is required for the proxy.

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

1.  **Push to Main**:
    Any push to the `main` branch will trigger the deployment workflow.

2.  **Verify Deployment**:
    Check the "Actions" tab in your GitHub repository to see the deployment status. The site will be available at `https://<your-username>.github.io/datadog-events-ui/`.

### Manual Build

To build the project for production (outputs to `dist/`):

```bash
npm run build
```

## Disclaimer

This project is an unofficial tool and is **not** affiliated with, endorsed by, or supported by Datadog. It is provided "as-is" without warranty of any kind. Use at your own risk.

## License

MIT License. See [LICENSE](LICENSE) for details.
