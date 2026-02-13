export interface PromptFirewallResult {
  safe: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// ✅ CRITICAL: Patterns that MUST be blocked
const BLOCKED_PATTERNS = [
  // System override attempts
  /ignore\s+(previous|above|system)\s+(instructions|prompt|rules)/i,
  /disregard\s+(all|previous)\s+(instructions|prompts)/i,
  /you\s+are\s+now/i,
  /act\s+as\s+if/i,
  /pretend\s+(you|to)\s+are/i,
  
  // Credential requests
  /api[_\s]?key/i,
  /password/i,
  /secret[_\s]?key/i,
  /access[_\s]?token/i,
  /private[_\s]?key/i,
  /bearer\s+token/i,
  
  // Malicious code patterns
  /eval\s*\(/i,
  /exec\s*\(/i,
  /<script[\s>]/i,
  /javascript:/i,
  /data:text\/html/i,
  /onclick\s*=/i,
  /onerror\s*=/i,
  
  // SQL injection attempts
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /'\s*or\s*'1'\s*=\s*'1/i,
  
  // XSS attempts
  /alert\s*\(/i,
  /confirm\s*\(/i,
  /prompt\s*\(/i,
  
  // System command injection
  /\$\(.*\)/,
  /`.*`/,
  /;\s*(rm|wget|curl|nc|bash)/i,
];

// Suspicious keywords (not blocked, but flagged)
const SUSPICIOUS_KEYWORDS = [
  'hack',
  'exploit',
  'vulnerability',
  'bypass',
  'crack',
  'malware',
  'phishing',
];

export async function checkPromptSafety(prompt: string): Promise<PromptFirewallResult> {
  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: 'Blocked pattern detected: potential security risk',
        riskLevel: 'high',
      };
    }
  }

  // Check length (very long prompts are suspicious)
  if (prompt.length > 10000) {
    return {
      safe: false,
      reason: 'Prompt too long (max 10,000 characters)',
      riskLevel: 'medium',
    };
  }

  // Check for excessive special characters (potential encoding attack)
  const specialCharCount = (prompt.match(/[^a-zA-Z0-9\s.,!?-]/g) || []).length;
  const specialCharRatio = specialCharCount / prompt.length;
  
  if (specialCharRatio > 0.3) {
    return {
      safe: false,
      reason: 'Excessive special characters detected',
      riskLevel: 'medium',
    };
  }

  // Check for suspicious keywords (warn but allow)
  const lowerPrompt = prompt.toLowerCase();
  const foundSuspicious = SUSPICIOUS_KEYWORDS.filter(kw => lowerPrompt.includes(kw));
  
  if (foundSuspicious.length > 2) {
    // Too many suspicious keywords
    return {
      safe: false,
      reason: `Multiple suspicious keywords: ${foundSuspicious.join(', ')}`,
      riskLevel: 'medium',
    };
  }

  // Prompt is safe
  return {
    safe: true,
    riskLevel: foundSuspicious.length > 0 ? 'low' : 'low',
  };
}

// Additional validation for generated code
export function validateGeneratedCode(code: string): boolean {
  const dangerousPatterns = [
    /<script[\s>]/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /Function\s*\(/i,
    /import\s*\(/i, // Dynamic imports could be risky
  ];

  return !dangerousPatterns.some(pattern => pattern.test(code));
}

// Rate limiting helper
const userRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, maxRequests: number = 50): boolean {
  const now = Date.now();
  const userData = userRequestCounts.get(userId);

  if (!userData || now > userData.resetAt) {
    // Reset or initialize
    userRequestCounts.set(userId, {
      count: 1,
      resetAt: now + 3600000, // 1 hour
    });
    return true;
  }

  if (userData.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  userData.count++;
  return true;
}
