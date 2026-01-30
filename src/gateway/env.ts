import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Helper to trim and return undefined if empty (handles whitespace-only values)
  const trimOrUndefined = (val: string | undefined): string | undefined => {
    const trimmed = val?.trim();
    return trimmed || undefined;
  };

  // Trim all input values to handle whitespace from user pasting in dashboard
  const baseUrl = trimOrUndefined(env.AI_GATEWAY_BASE_URL);
  const gatewayApiKey = trimOrUndefined(env.AI_GATEWAY_API_KEY);
  const providerApiKey = trimOrUndefined(env.AI_GATEWAY_PROVIDER_API_KEY);
  const customProvider = trimOrUndefined(env.AI_GATEWAY_CUSTOM_PROVIDER);
  const anthropicApiKey = trimOrUndefined(env.ANTHROPIC_API_KEY);
  const openaiApiKey = trimOrUndefined(env.OPENAI_API_KEY);
  const anthropicBaseUrl = trimOrUndefined(env.ANTHROPIC_BASE_URL);

  // Normalize URL for suffix detection (handle trailing slashes)
  const normalizedUrl = baseUrl?.replace(/\/+$/, '') || '';
  const isCompatGateway = normalizedUrl.endsWith('/compat');
  const isOpenAIGateway = normalizedUrl.endsWith('/openai');

  // AI Gateway vars take precedence
  // Map to the appropriate provider env var based on the gateway endpoint
  if (isCompatGateway) {
    // Custom provider mode using Cloudflare AI Gateway compat endpoint
    // - AI_GATEWAY_PROVIDER_API_KEY → OPENAI_API_KEY (for Authorization header)
    // - AI_GATEWAY_API_KEY → CF_AIG_AUTHORIZATION (for cf-aig-authorization header)
    // - AI_GATEWAY_CUSTOM_PROVIDER → AI_GATEWAY_CUSTOM_PROVIDER (for model prefix)
    if (providerApiKey) {
      envVars.OPENAI_API_KEY = providerApiKey;
    }
    if (gatewayApiKey) {
      envVars.CF_AIG_AUTHORIZATION = gatewayApiKey;
    }
    if (customProvider) {
      envVars.AI_GATEWAY_CUSTOM_PROVIDER = customProvider;
    }
  } else if (gatewayApiKey) {
    if (isOpenAIGateway) {
      envVars.OPENAI_API_KEY = gatewayApiKey;
    } else {
      envVars.ANTHROPIC_API_KEY = gatewayApiKey;
    }
  }

  // Fall back to direct provider keys
  if (!envVars.ANTHROPIC_API_KEY && anthropicApiKey) {
    envVars.ANTHROPIC_API_KEY = anthropicApiKey;
  }
  if (!envVars.OPENAI_API_KEY && openaiApiKey) {
    envVars.OPENAI_API_KEY = openaiApiKey;
  }

  // Pass base URL (used by start-moltbot.sh to determine provider)
  if (baseUrl) {
    envVars.AI_GATEWAY_BASE_URL = baseUrl;
    // Also set the provider-specific base URL env var
    if (isCompatGateway) {
      // For compat mode, use OPENAI_BASE_URL since we use OpenAI-compatible API
      envVars.OPENAI_BASE_URL = baseUrl;
    } else if (isOpenAIGateway) {
      envVars.OPENAI_BASE_URL = baseUrl;
    } else {
      envVars.ANTHROPIC_BASE_URL = baseUrl;
    }
  } else if (anthropicBaseUrl) {
    envVars.ANTHROPIC_BASE_URL = anthropicBaseUrl;
  }
  // Map MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.CLAWDBOT_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE; // Pass DEV_MODE as CLAWDBOT_DEV_MODE to container
  if (env.CLAWDBOT_BIND_MODE) envVars.CLAWDBOT_BIND_MODE = env.CLAWDBOT_BIND_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  return envVars;
}
