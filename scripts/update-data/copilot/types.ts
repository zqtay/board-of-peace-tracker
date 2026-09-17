export type CopilotClientOptions = {
  token: string;
  model?: string;
  isReasoningModel?: boolean;
}

export type SessionToken = {
  token: string;
  expires_at: number;
}

/** Raw token usage shape returned by the OpenAI-compatible Copilot API. */
export type RawUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

/** Raw Copilot-specific billing block returned alongside `usage`. */
export type RawCopilotUsage = {
  /** Total billed cost in nano-AIU (billionths of an AI Unit). */
  total_nano_aiu?: number;
  token_details?: {
    batch_size: number;
    cost_per_batch: number;
    token_count: number;
    token_type: 'input' | 'cache_read' | 'cache_write' | 'output';
  }[];
}

/** A text content part in a multimodal message. */
export interface TextContentPart {
  type: 'text';
  text: string;
}

/** An image URL content part in a multimodal message. */
export interface ImageContentPart {
  type: 'image_url';
  image_url: { url: string };
}

/** Content that can be a plain string or an array of multimodal parts. */
export type MessageContent = string | (TextContentPart | ImageContentPart)[];

/** A single message in a chat completion conversation. */
export interface ChatMessage {
  /** The message sender: 'system', 'user', or 'assistant'. */
  role: 'system' | 'user' | 'assistant';
  /** The text content of the message, or multimodal content parts. */
  content: MessageContent;
}

/** Options for the AI chat completion request. */
export interface ChatOptions {
  /** Sampling temperature (0 = deterministic, higher = more creative). */
  temperature?: number;
  /** Maximum number of tokens in the response. */
  maxTokens?: number;
  /**
   * How much reasoning effort the model should expend before producing an answer.
   */
  reasoningEffort?: 'low' | 'medium' | 'high';
}

/** Token usage statistics reported by the AI API for a single completion. */
export interface TokenUsage {
  /** Unique request ID for this completion, useful for debugging or support. */
  requestId: string;
  /** Number of tokens in the prompt (input). */
  promptTokens: number;
  /** Number of tokens in the completion (output). */
  completionTokens: number;
  /** Total tokens consumed (prompt + completion). */
  totalTokens: number;
  /**
   * Total billed cost in nano-AIU (billionths of an AI Unit), as reported by
   * the Copilot API's `copilot_usage.total_nano_aiu`. Null when not reported.
   */
  costNanoAiu: number | null;
  /**
   * Total billed cost in AIU (AI Units) — `costNanoAiu` divided by 1e9.
   * Null when the API did not report cost.
   */
  costAiu: number | null;
}

/** The result of a chat completion request: response content plus token usage. */
export interface ChatResult {
  /** The assistant's response content. */
  content: string;
  /** Token usage for the request, or null if the API did not report it. */
  usage: TokenUsage | null;
}
