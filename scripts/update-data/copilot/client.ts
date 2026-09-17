import { ChatMessage, ChatOptions, ChatResult, CopilotClientOptions, RawCopilotUsage, RawUsage, SessionToken, TokenUsage } from './types';

const COPILOT_VERSION = "0.52.0";
const EDITOR_PLUGIN_VERSION = `copilot-chat/${COPILOT_VERSION}`;
const USER_AGENT = `GitHubCopilotChat/${COPILOT_VERSION}`;
const API_VERSION = "2026-06-01";
const VSCODE_VERSION = "1.124.2";
const VSCODE_DEVICE_ID = crypto.randomUUID();

/**
 * Client for interacting with GitHub Copilot Chat API.
 */
export default class CopilotClient {
  private accessToken: string;
  private sessionToken: SessionToken | null = null;
  private model: string;
  private isReasoningModel: boolean;
  private baseUrl = 'https://api.githubcopilot.com';

  constructor({ token, model, isReasoningModel }: CopilotClientOptions) {
    this.accessToken = token;
    this.model = model || 'gpt-4o';
    this.isReasoningModel = isReasoningModel || false;
  }

  /**
   * Check if the cached session token is expired or about to expire (30s buffer).
   */
  private isTokenExpired(): boolean {
    if (!this.sessionToken) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec >= this.sessionToken.expires_at - 30;
  }

  /**
   * Fetch a short-lived Copilot session token from the access token.
   * Caches the result and auto-refreshes when expired (with a 30s buffer).
   */
  private async getSessionToken(): Promise<string> {
    if (this.sessionToken?.token && !this.isTokenExpired()) {
      return this.sessionToken.token;
    }

    console.debug('Fetching new Copilot session token...');

    const resp = await fetch('https://api.github.com/copilot_internal/v2/token', {
      headers: {
        authorization: `token ${this.accessToken}`,
        'editor-version': 'Neovim/0.6.1',
        'editor-plugin-version': 'copilot.vim/1.16.0',
        'user-agent': 'GithubCopilot/1.155.0',
      },
    });

    const respJson = await resp.json() as SessionToken;
    if (!respJson.token) {
      throw new Error(`Failed to get session token: ${JSON.stringify(respJson)}`);
    }

    this.sessionToken = respJson;
    return this.sessionToken.token;
  }

  /**
   * Send a chat completion request with automatic endpoint fallback.
   * Tries the Copilot API first, then the GitHub Models API.
   * @param messages - The conversation messages to send.
   * @param options - Optional temperature and max token overrides.
   * @returns The assistant's response content along with token usage (usage is
   *   null if the API did not report it).
   * @throws If all API endpoints fail.
   */
  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const body = {
      model: this.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      n: 1,
      stream: true,
      // Opt in to a final usage chunk — streamed responses omit token counts
      // unless include_usage is set.
      stream_options: { include_usage: true },
      // Remove reasoning_effort for non-reasoning models to avoid error
      ...(this.isReasoningModel) ? { reasoning_effort: options.reasoningEffort } : {},
    };

    const sessionToken = await this.getSessionToken();
    const requestIdValue = crypto.randomUUID();

    const endpoint = {
      url: `${this.baseUrl}/chat/completions`,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "content-type": 'application/json',
        "copilot-integration-id": "vscode-chat",
        "editor-device-id": VSCODE_DEVICE_ID,
        "editor-version": `vscode/${VSCODE_VERSION}`,
        "editor-plugin-version": EDITOR_PLUGIN_VERSION,
        "user-agent": USER_AGENT,
        "openai-intent": "conversation-agent",
        "x-github-api-version": API_VERSION,
        "x-request-id": requestIdValue,
        "x-vscode-user-agent-library-version": "electron-fetch",
        "x-agent-task-id": requestIdValue,
        "x-interaction-type": "conversation-agent",
        "copilot-vision-request": "true",
        "x-initiator": "user",
      },
    };

    console.debug(`Sending chat request to ${endpoint.url} with model ${this.model}, ` +
      `temperature=${options.temperature}, maxTokens=${options.maxTokens}, requestId=${requestIdValue}`);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: endpoint.headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.debug(`Endpoint ${endpoint.url} returned ${response.status}: ${errorText}`);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      console.debug(`Received response from ${endpoint.url} with status ${response.status}, requestId=${requestIdValue}`);
      const respText = await response.text();
      let result = "";
      let usage: TokenUsage | null = null;
      let finishReason: string | null = null;

      // Parse the SSE response, extracting completions from each data line
      for (const line of respText.split("\n")) {
        if (!line) continue;
        try {
          if (line.startsWith("data: ")) {
            let jsonData;
            try {
              jsonData = JSON.parse(line.slice(6));
            } catch (e) {
              if (line.slice(6).trim() === "[DONE]") {
                console.debug('Stream completed with [DONE] signal.');
                break;
              }
              console.debug(`Failed to parse line as JSON: ${line}`);
              continue;
            }
            if (jsonData.choices) {
              const completion = jsonData.choices[0]?.delta?.content ?? "";
              if (completion) {
                result += completion;
              }
              // Track why the model stopped. Reasoning models emit
              // `reasoning_text` deltas before any `content`; if the token
              // budget runs out first, finish_reason is "length" and content
              // is empty — surface this so it isn't a silent failure.
              const reason = jsonData.choices[0]?.finish_reason;
              if (reason) {
                finishReason = reason;
              }
            }
            // The final usage chunk carries token counts and an empty choices
            // array — capture it whenever it appears.
            if (jsonData.usage) {
              const raw = jsonData.usage as RawUsage;
              // Copilot reports billing separately in `copilot_usage`; convert
              // nano-AIU (billionths of an AI Unit) to AIU for readability.
              const rawCost = jsonData.copilot_usage as RawCopilotUsage | undefined;
              const costNanoAiu = rawCost?.total_nano_aiu ?? null;
              usage = {
                requestId: requestIdValue,
                promptTokens: raw.prompt_tokens ?? 0,
                completionTokens: raw.completion_tokens ?? 0,
                totalTokens: raw.total_tokens ?? 0,
                costNanoAiu,
                costAiu: costNanoAiu === null ? null : costNanoAiu / 1e9,
              };
            }
          }
        } catch {
          continue;
        }
      }

      if (finishReason === 'length') {
        console.warn(
          `Copilot response was truncated (finish_reason=length) after ${usage?.completionTokens ?? '?'} completion tokens. ` +
          `The output budget (max_tokens) was fully consumed — for reasoning models this often means reasoning used the whole budget before any content was produced. Consider increasing maxTokens.`,
        );
      }
      console.debug(
        `Chat request completed with finish_reason=${finishReason}, ` +
        `total tokens=${usage?.totalTokens}, requestId=${requestIdValue}`
      );
      return { content: result, usage };
    } catch (err) {
      console.debug(`Endpoint ${endpoint.url} failed: ${(err as Error).message}`);
      throw err as Error;
    }
  }
}
