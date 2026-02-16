import { spawn } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export interface ClaudeResult {
  success: boolean
  output: string
  error?: string
}

export async function runClaude(
  prompt: string,
  cwd?: string
): Promise<ClaudeResult> {
  return new Promise((resolve) => {
    const tempFile = join(tmpdir(), `claude-prompt-${Date.now()}.txt`)
    writeFileSync(tempFile, prompt, 'utf-8')

    const command =
      process.platform === 'win32'
        ? `type "${tempFile}" | claude -p --dangerously-skip-permissions`
        : `cat "${tempFile}" | claude -p --dangerously-skip-permissions`

    console.log(`[ClaudeRunner] Running Claude CLI...`)

    const { CLAUDECODE: _, ...cleanEnv } = process.env
    const proc = spawn(command, [], {
      cwd: cwd ?? process.cwd(),
      shell: true,
      env: { ...cleanEnv, CI: 'true' },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      const text = data.toString()
      stdout += text
      process.stdout.write(text)
    })

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString()
      stderr += text
      process.stderr.write(text)
    })

    proc.on('close', (code: number | null) => {
      try { unlinkSync(tempFile) } catch { /* ignore */ }

      if (code === 0) {
        resolve({ success: true, output: stdout })
      } else {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Process exited with code ${code}`,
        })
      }
    })

    proc.on('error', (err: Error) => {
      try { unlinkSync(tempFile) } catch { /* ignore */ }
      resolve({
        success: false,
        output: '',
        error: `Failed to start Claude: ${err.message}`,
      })
    })
  })
}

export function parseJsonFromOutput(output: string): unknown | null {
  // Try direct parse first
  try {
    return JSON.parse(output.trim())
  } catch { /* continue */ }

  // Try to extract JSON from markdown code blocks
  const codeBlockMatch = output.match(/```(?:json)?\s*\n?([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch { /* continue */ }
  }

  // Try to find a JSON object or array in the output
  const jsonMatch = output.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch { /* continue */ }
  }

  return null
}
