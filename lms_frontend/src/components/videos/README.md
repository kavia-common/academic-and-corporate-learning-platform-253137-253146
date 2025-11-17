# Video Components

## VideoRedirect

A minimal component that navigates the user to a provided `videoUrl`. This is used as a fallback when a provider cannot be embedded (e.g., blocked by X-Frame-Options) or when the user chooses "Open externally".

Usage:

```jsx
import VideoRedirect from './VideoRedirect';

<VideoRedirect videoUrl={someUrl} replace={false} />
```

- `videoUrl` (string, required): Destination URL.
- `replace` (boolean, optional): Use `location.replace` instead of `href` to avoid adding a history entry.

## Embedding Helpers

Utility helpers are available at `src/utils/videoEmbed.js`:
- `isGoogleDriveLink(url)`
- `getDrivePreviewEmbedUrl(url)`
- `canEmbedProvider(url)` – currently returns true only for Google Drive links.

Default behavior:
- If the URL is a Google Drive link, we attempt to render the Drive preview embed (`/preview`).
- If the provider is unrecognized or embedding is blocked, render a small UI with buttons:
  - "Open in new tab" (window.open)
  - "Open externally (redirect)" which mounts `VideoRedirect`.
