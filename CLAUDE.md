# Claude Code Instructions

## Repository Setup

This project is mirrored to two GitHub repositories that must be kept in sync:

- `origin` → https://github.com/izzoa/moltworker-aig.git
- `moltbot` → https://github.com/izzoa/moltbot.git

## Push Requirements

**All changes must be pushed to both repos simultaneously.**

After committing, always run:
```bash
git push origin main && git push moltbot main
```

## Project Overview

Moltbot on Cloudflare Workers - runs the Moltbot personal AI assistant in a Cloudflare Sandbox container.

### Key Features

- **AI Gateway Custom Provider Support**: Uses Cloudflare AI Gateway's `/compat` endpoint for custom provider routing
- **Dual Authentication**: Supports both `Authorization` (provider key) and `cf-aig-authorization` (gateway key) headers
- **Model Naming**: Custom provider models use pattern `custom-{provider_name}/{model_id}`

### Important Files

| File | Purpose |
|------|---------|
| `src/types.ts` | Environment variable type definitions |
| `src/gateway/env.ts` | Maps worker env vars to container env vars |
| `src/index.ts` | Main worker entry point with validation |
| `start-moltbot.sh` | Container startup script, configures moltbot |
| `.dev.vars.example` | Defines secrets for Deploy to Cloudflare button |
| `package.json` | Contains `cloudflare.bindings` descriptions for deploy button |

### Environment Variables (Custom Provider Mode)

| Variable | Description |
|----------|-------------|
| `AI_GATEWAY_BASE_URL` | Gateway URL ending in `/compat` |
| `AI_GATEWAY_API_KEY` | Gateway auth key (cf-aig-authorization header) |
| `AI_GATEWAY_PROVIDER_API_KEY` | Provider API key (Authorization header) |
| `AI_GATEWAY_CUSTOM_PROVIDER` | Custom provider name (e.g., `cliproxyapi-anthropic`) |

### Testing

```bash
npm test        # Run tests
npm run build   # Build the project
npm run deploy  # Build and deploy to Cloudflare
```
