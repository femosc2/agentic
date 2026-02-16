import type { ReactNode } from 'react'
import styles from './styles.module.scss'

interface MarkdownProps {
  content: string
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|`(.+?)`/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      parts.push(<strong key={match.index}>{match[1]}</strong>)
    } else if (match[2]) {
      parts.push(<code key={match.index}>{match[2]}</code>)
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

export function Markdown({ content }: MarkdownProps) {
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h5 key={i}>{renderInline(line.slice(4))}</h5>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h4 key={i}>{renderInline(line.slice(3))}</h4>)
      i++
      continue
    }

    // Bullet list
    if (/^[-*]\s/.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^[-*]\s/, ''))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>)
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph
    elements.push(<p key={i}>{renderInline(line)}</p>)
    i++
  }

  return <div className={styles.markdown}>{elements}</div>
}
