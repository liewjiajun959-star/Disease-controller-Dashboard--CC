import { z } from 'zod';

// ─── Blocked pattern lists ────────────────────────────────────────────────────

const GPT_LLM_TERMS = [
  'gpt', 'chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'copilot',
  'llama', 'mistral', 'llm', 'ai assistant', 'artificial intelligence',
  'language model', 'large language model',
];

const PROMPT_INSTRUCTION_TERMS = [
  'act as', 'pretend to be', 'you are now', 'ignore previous', 'ignore all',
  'ignore instructions', 'system prompt', 'developer message', 'developer mode',
  'jailbreak', 'bypass', 'override', 'new instructions', 'forget previous',
  'disregard', 'your instructions', 'your guidelines',
];

const UNSUPPORTED_REQUEST_TERMS = [
  'write code', 'generate code', 'create prompt', 'generate prompt',
  'summarize this', 'summarize the', 'search youtube', 'search the web',
  'search web', 'scrape', 'execute', 'run command', 'run script',
  'eval(', 'script', 'fetch all', 'get all data', 'download',
  'translate', 'write a', 'generate a', 'create a', 'make a',
];

const CODE_INJECTION_PATTERNS = [
  /<script/i,
  /<\/script>/i,
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
  /blob:/i,
  /file:/i,
  /on\w+\s*=/i,            // onerror=, onclick=, onload=, etc.
  /SELECT\s+\*?\s+FROM/i,  // SQL injection
  /DROP\s+TABLE/i,
  /INSERT\s+INTO/i,
  /UNION\s+SELECT/i,
  /DELETE\s+FROM/i,
  /UPDATE\s+\w+\s+SET/i,
  /rm\s+-rf/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /powershell/i,
  /cmd\.exe/i,
  /\bbash\b/i,
  /\b\/bin\/sh\b/,
  /<iframe/i,
  /srcdoc/i,
  /expression\s*\(/i,      // CSS expression()
  /&#\d+;/,                // HTML entities that could encode attacks
  /\\u[0-9a-fA-F]{4}/,    // Unicode escape sequences
];

// ─── Guard functions ──────────────────────────────────────────────────────────

export function isGptOrLlmRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return GPT_LLM_TERMS.some((term) => lower.includes(term));
}

export function isPromptInstruction(input: string): boolean {
  const lower = input.toLowerCase();
  return PROMPT_INSTRUCTION_TERMS.some((term) => lower.includes(term));
}

export function isUnsupportedFreeformRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return UNSUPPORTED_REQUEST_TERMS.some((term) => lower.includes(term));
}

export function isCodeLikeInput(input: string): boolean {
  return CODE_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export function isPromptInjectionLikeInput(input: string): boolean {
  return (
    isGptOrLlmRequest(input) ||
    isPromptInstruction(input) ||
    isUnsupportedFreeformRequest(input) ||
    isCodeLikeInput(input)
  );
}

// Detect excessive punctuation or repeated symbols (common in injection attempts)
function hasExcessivePunctuation(input: string): boolean {
  const punctuationRatio = (input.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?\/~`]/g) || []).length / input.length;
  return punctuationRatio > 0.25;
}

// Detect repeated symbol sequences (e.g., "!!!!", "----", "====")
function hasRepeatedSymbols(input: string): boolean {
  return /(.)\1{4,}/.test(input);
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const AddressInputSchema = z
  .string()
  .min(2, 'Enter at least 2 characters')
  .max(120, 'Address too long (max 120 characters)')
  .refine((v) => !isPromptInjectionLikeInput(v), {
    message: 'This field only accepts addresses, locations, postal codes, or coordinates for nearby cluster detection.',
  })
  .refine((v) => !hasExcessivePunctuation(v), {
    message: 'This field only accepts addresses, locations, postal codes, or coordinates for nearby cluster detection.',
  })
  .refine((v) => !hasRepeatedSymbols(v), {
    message: 'This field only accepts addresses, locations, postal codes, or coordinates for nearby cluster detection.',
  });

const DistanceInputSchema = z
  .number()
  .positive('Distance must be greater than 0')
  .max(50000, 'Maximum distance is 50,000 meters (50 km)');

// ─── Public validation functions ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateAddressInput(input: string): ValidationResult {
  const result = AddressInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: null };
  return {
    valid: false,
    error: result.error.errors[0]?.message ?? 'Invalid input',
  };
}

export function validateDistanceInput(value: number): ValidationResult {
  const result = DistanceInputSchema.safeParse(value);
  if (result.success) return { valid: true, error: null };
  return {
    valid: false,
    error: result.error.errors[0]?.message ?? 'Invalid distance',
  };
}

export function normalizeLocationInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'hw_search_rate';
const MIN_COOLDOWN_MS = 3000;
const MAX_SEARCHES_PER_SESSION = 30;

interface RateLimitState {
  count: number;
  lastSearchMs: number;
}

function getRateLimitState(): RateLimitState {
  if (typeof window === 'undefined') return { count: 0, lastSearchMs: 0 };
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { count: 0, lastSearchMs: 0 };
    return JSON.parse(raw) as RateLimitState;
  } catch {
    return { count: 0, lastSearchMs: 0 };
  }
}

function setRateLimitState(state: RateLimitState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable — fail silently
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason: 'cooldown' | 'session_limit' | null;
  remainingCooldownMs: number;
}

export function enforceSearchRateLimit(): RateLimitResult {
  const state = getRateLimitState();
  const now = Date.now();

  if (state.count >= MAX_SEARCHES_PER_SESSION) {
    return { allowed: false, reason: 'session_limit', remainingCooldownMs: 0 };
  }

  const elapsed = now - state.lastSearchMs;
  if (state.lastSearchMs > 0 && elapsed < MIN_COOLDOWN_MS) {
    return {
      allowed: false,
      reason: 'cooldown',
      remainingCooldownMs: MIN_COOLDOWN_MS - elapsed,
    };
  }

  setRateLimitState({ count: state.count + 1, lastSearchMs: now });
  return { allowed: true, reason: null, remainingCooldownMs: 0 };
}

// The standard rejection message — always shown regardless of rejection reason
// Never echo back the user's input
export const REJECTION_MESSAGE =
  'This field only accepts addresses, locations, postal codes, or coordinates for nearby cluster detection.';
