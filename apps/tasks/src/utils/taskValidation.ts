/**
 * Patterns that indicate potentially dangerous task requests.
 * These are checked client-side to warn users before submission.
 */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  // Secrets/credentials exposure
  { pattern: /\b(env|environment)\s*(var|variable)/i, reason: 'Tasks involving environment variables are not allowed' },
  { pattern: /\b(api[_-]?key|secret|token|credential|password)\b/i, reason: 'Tasks involving secrets or credentials are not allowed' },
  { pattern: /\bprocess\.env\b/i, reason: 'Accessing process.env is not allowed' },
  { pattern: /\bimport\.meta\.env\b/i, reason: 'Accessing import.meta.env is not allowed' },
  { pattern: /\.env\s*file/i, reason: 'Modifying .env files is not allowed' },
  { pattern: /\b(print|log|show|display|output)\b.{0,20}\b(env|key|secret|token)/i, reason: 'Exposing sensitive data is not allowed' },

  // Security modifications
  { pattern: /\b(remove|disable|bypass|skip|delete)\s*(auth|authentication|login)/i, reason: 'Modifying authentication is not allowed' },
  { pattern: /\b(remove|disable)\s*(security|protection|validation)/i, reason: 'Disabling security features is not allowed' },
  { pattern: /\bfirestore\.?rules\b/i, reason: 'Modifying Firestore rules is not allowed' },
  { pattern: /\bsecurity\s*rules?\b/i, reason: 'Modifying security rules is not allowed' },

  // Destructive operations
  { pattern: /\b(delete|remove|drop)\s*(all|every|\*|database|collection|table|files?|folder|director)/i, reason: 'Bulk deletion operations are not allowed' },
  { pattern: /\brm\s+-rf\b/i, reason: 'Recursive force deletion is not allowed' },
  { pattern: /\bdel\s+\/[sq]/i, reason: 'Recursive deletion is not allowed' },
  { pattern: /\b(wipe|clear|reset)\s*(data|database|storage)/i, reason: 'Wiping data is not allowed' },

  // System/config modifications
  { pattern: /\bgit\s*(config|credential)/i, reason: 'Modifying git configuration is not allowed' },
  { pattern: /\bnpm\s*(config|set)/i, reason: 'Modifying npm configuration is not allowed' },
  { pattern: /\b(install|add)\s*(-g|--global)/i, reason: 'Installing global packages is not allowed' },
]

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates a task title and description against dangerous patterns.
 * Returns validation result with error message if invalid.
 */
export function validateTask(title: string, description?: string): ValidationResult {
  const fullText = `${title} ${description || ''}`

  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(fullText)) {
      return { isValid: false, error: reason }
    }
  }

  return { isValid: true }
}

/**
 * Example tasks that are allowed (for UI hints)
 */
export const ALLOWED_TASK_EXAMPLES = [
  'Add a tic-tac-toe game page',
  'Change the header to a hamburger menu on mobile',
  'Add a dark mode toggle',
  'Create a contact form component',
  'Add pagination to the task list',
  'Update the footer design',
  'Add form validation to the login page',
]

/**
 * Example tasks that are NOT allowed (for UI hints)
 */
export const FORBIDDEN_TASK_EXAMPLES = [
  'Print all environment variables',
  'Remove the authentication login',
  'Delete all files in the project',
  'Show me the API keys',
  'Disable security validation',
]
