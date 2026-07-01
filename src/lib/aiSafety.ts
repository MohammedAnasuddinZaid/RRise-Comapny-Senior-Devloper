/**
 * AI Safety Layer
 * 
 * This file provides safety checks and content filtering for AI interactions.
 * It helps prevent harmful, inappropriate, or malicious content from being
 * generated or processed by the AI system.
 * 
 * Features:
 * - Input validation and sanitization
 * - Content filtering for harmful content
 * - Rate limiting and abuse prevention
 * - PII detection and masking
 * - Output safety checks
 */

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  filteredContent?: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Content categories for filtering
 */
type ContentCategory = 
  | 'hate_speech'
  | 'violence'
  | 'self_harm'
  | 'sexual_content'
  | 'harassment'
  | 'illegal_activities'
  | 'medical_advice'
  | 'financial_advice'
  | 'personal_info';

/**
 * Blocked words and phrases (simplified list)
 * In production, this should be more comprehensive and possibly use ML models
 */
const BLOCKED_PHRASES: Record<ContentCategory, string[]> = {
  hate_speech: [], // handled by AI provider guardrails
  violence: ['murder', 'massacre', 'genocide'],
  self_harm: ['suicide', 'kill myself', 'end my life', 'hurt myself'],
  sexual_content: [],
  harassment: ['stalking', 'doxxing'],
  illegal_activities: [], // too broad - let AI provider handle it
  medical_advice: [], // too broad - let AI provider handle it  
  financial_advice: [], // too broad - words like invest/stock are normal
  personal_info: [], // PII patterns handled separately
};

/**
 * PII patterns for detection
 */
const PII_PATTERNS = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
  { pattern: /\b\d{16}\b/g, type: 'Credit Card' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'Email' },
  { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, type: 'Phone' },
];

/**
 * Check if input contains harmful content
 * 
 * @param input - User input to check
 * @returns Safety check result
 */
export function checkInputSafety(input: string): SafetyCheckResult {
  const lowerInput = input.toLowerCase();
  
  // Check for blocked phrases
  for (const [category, phrases] of Object.entries(BLOCKED_PHRASES)) {
    for (const phrase of phrases) {
      if (lowerInput.includes(phrase)) {
        return {
          isSafe: false,
          reason: `Content contains potentially harmful ${category.replace('_', ' ')}`,
          severity: category === 'self_harm' ? 'high' : 'medium',
        };
      }
    }
  }
  
  // Check for PII
  const piiDetected = detectPII(input);
  if (piiDetected.length > 0) {
    return {
      isSafe: true,
      reason: 'PII detected and will be masked',
      filteredContent: maskPII(input),
      severity: 'low',
    };
  }
  
  return {
    isSafe: true,
    severity: 'low',
  };
}

/**
 * Detect PII in text
 * 
 * @param text - Text to check
 * @returns Array of detected PII types
 */
function detectPII(text: string): string[] {
  const detected: string[] = [];
  
  for (const { pattern, type } of PII_PATTERNS) {
    if (pattern.test(text)) {
      detected.push(type);
    }
  }
  
  return detected;
}

/**
 * Mask PII in text
 * 
 * @param text - Text to mask
 * @returns Text with PII masked
 */
function maskPII(text: string): string {
  let masked = text;
  
  for (const { pattern, type } of PII_PATTERNS) {
    masked = masked.replace(pattern, `[${type} REMOVED]`);
  }
  
  return masked;
}

/**
 * Check if AI output is safe
 * 
 * @param output - AI output to check
 * @returns Safety check result
 */
export function checkOutputSafety(output: string): SafetyCheckResult {
  const lowerOutput = output.toLowerCase();
  
  // Check for blocked phrases in output
  for (const [category, phrases] of Object.entries(BLOCKED_PHRASES)) {
    for (const phrase of phrases) {
      if (lowerOutput.includes(phrase)) {
        return {
          isSafe: false,
          reason: `AI output contains potentially harmful ${category.replace('_', ' ')}`,
          severity: 'high',
        };
      }
    }
  }
  
  // Check for PII in output
  const piiDetected = detectPII(output);
  if (piiDetected.length > 0) {
    return {
      isSafe: false,
      reason: 'AI output contains personal information',
      severity: 'high',
    };
  }
  
  // Check for truly suspicious patterns (soliciting credentials, not normal content)
  const suspiciousPatterns = [
    /your password is/i,
    /enter your credit card/i,
    /give me your social security/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(output)) {
      return {
        isSafe: false,
        reason: 'AI output contains suspicious patterns',
        severity: 'medium',
      };
    }
  }
  
  return {
    isSafe: true,
    severity: 'low',
  };
}

/**
 * Sanitize user input
 * 
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  const maxLength = 5000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Rate limiting check
 * 
 * @param userId - User ID
 * @param maxRequests - Maximum requests per time window
 * @param timeWindow - Time window in milliseconds
 * @returns Whether the user is rate limited
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  timeWindow: number = 60000 // 1 minute
): { isLimited: boolean; remainingRequests: number } {
  // In a real implementation, this would use Redis or a database
  // For now, we'll use a simple in-memory store
  
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  
  // Get stored requests (this would be from a real store)
  const stored = localStorage.getItem(key);
  const requests: number[] = stored ? JSON.parse(stored) : [];
  
  // Filter out old requests
  const validRequests = requests.filter(timestamp => now - timestamp < timeWindow);
  
  // Check if rate limited
  if (validRequests.length >= maxRequests) {
    return {
      isLimited: true,
      remainingRequests: 0,
    };
  }
  
  // Add current request
  validRequests.push(now);
  localStorage.setItem(key, JSON.stringify(validRequests));
  
  return {
    isLimited: false,
    remainingRequests: maxRequests - validRequests.length,
  };
}

/**
 * Comprehensive safety check for AI interaction
 * 
 * @param userId - User ID
 * @param input - User input
 * @returns Safety check result with any necessary actions
 */
export async function performSafetyCheck(
  userId: string,
  input: string
): Promise<{
  isSafe: boolean;
  reason?: string;
  sanitizedInput?: string;
  isRateLimited?: boolean;
}> {
  // Check rate limit
  const rateLimit = checkRateLimit(userId);
  if (rateLimit.isLimited) {
    return {
      isSafe: false,
      reason: 'Rate limit exceeded. Please wait before making another request.',
      isRateLimited: true,
    };
  }
  
  // Sanitize input
  const sanitized = sanitizeInput(input);
  
  // Check input safety
  const inputSafety = checkInputSafety(sanitized);
  
  if (!inputSafety.isSafe) {
    return {
      isSafe: false,
      reason: inputSafety.reason,
      sanitizedInput: inputSafety.filteredContent || sanitized,
    };
  }
  
  return {
    isSafe: true,
    sanitizedInput: inputSafety.filteredContent || sanitized,
  };
}

/**
 * Filter AI response for safety
 * 
 * @param response - AI response to filter
 * @returns Filtered response or error if unsafe
 */
export function filterAIResponse(response: string): {
  isSafe: boolean;
  filteredResponse?: string;
  reason?: string;
} {
  const safetyCheck = checkOutputSafety(response);
  
  if (!safetyCheck.isSafe) {
    return {
      isSafe: false,
      reason: safetyCheck.reason,
    };
  }
  
  return {
    isSafe: true,
    filteredResponse: response,
  };
}

/**
 * Log safety violation for monitoring
 * 
 * @param userId - User ID
 * @param violationType - Type of violation
 * @param details - Additional details
 */
export function logSafetyViolation(
  userId: string,
  violationType: string,
  details: string
): void {
  // In production, this would log to a monitoring system
  console.warn(`Safety violation - User: ${userId}, Type: ${violationType}, Details: ${details}`);
  
  // Could also trigger alerts for high-severity violations
}
