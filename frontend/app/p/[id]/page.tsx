'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import hljs from 'highlight.js/lib/core'
import pythonLang from 'highlight.js/lib/languages/python'
import javascriptLang from 'highlight.js/lib/languages/javascript'
import goLang from 'highlight.js/lib/languages/go'
import rustLang from 'highlight.js/lib/languages/rust'
import sqlLang from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('python', pythonLang)
hljs.registerLanguage('javascript', javascriptLang)
hljs.registerLanguage('go', goLang)
hljs.registerLanguage('rust', rustLang)
hljs.registerLanguage('sql', sqlLang)

const API = 'http://localhost:3001'

type PasteStatus = 'loading' | 'not_found' | 'expired' | 'password_required' | 'loaded'

interface PasteData {
  id: string
  code: string
  language: string
  expiry_info: string
  has_password: boolean
}

export default function PastePage() {
  const params = useParams()
  const id = params.id as string

  const [status, setStatus] = useState<PasteStatus>('loading')
  const [paste, setPaste] = useState<PasteData | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)

  const fetchPaste = useCallback(
    async (password?: string, skipView?: boolean) => {
      const qs = new URLSearchParams()
      if (password) qs.set('password', password)
      if (skipView) qs.set('skip_view', 'true')

      const res = await fetch(`${API}/api/pastes/${id}?${qs.toString()}`)

      if (res.status === 404) { setStatus('not_found'); return }
      if (res.status === 410) { setStatus('expired'); return }
      if (res.status === 403) { setStatus('password_required'); return }

      if (res.ok) {
        const data = await res.json()
        setPaste(data)
        setStatus('loaded')
      }
    },
    [id],
  )

  useEffect(() => {
    const hash = window.location.hash
    const match = hash.match(/^#L(\d+)$/)
    if (match) setHighlightedLine(parseInt(match[1], 10))

    const justCreated = sessionStorage.getItem('just_created') === id
    if (justCreated) sessionStorage.removeItem('just_created')

    const savedPassword = sessionStorage.getItem(`unlocked_${id}`) ?? undefined
    fetchPaste(savedPassword, justCreated)
  }, [id, fetchPaste])

  function handleLineClick(lineNum: number) {
    setHighlightedLine(lineNum)
    window.history.replaceState(null, '', `#L${lineNum}`)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(false)

    const qs = new URLSearchParams({ password: passwordInput })
    const res = await fetch(`${API}/api/pastes/${id}?${qs.toString()}`)sss
          border: '1px solid #30363d',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            fontSize: 13,
          }}
        >
          <tbody>
            {<highlightedLines className="ssss">

            </highlightedLines>map((html, idx) => {
              const lineNum = idx + 1
              const isHighlighted = highlightedLine === lineNum
              return (
                <tr
                  key={lineNum}
                  className={isHighlighted ? 'line-row highlighted' : 'line-row'}
                >
                  <td
                    data-testid="line-number"
                    data-line={String(lineNum)}
                    onClick={() => handleLineClick(lineNum)}
                    style={{
                      userSelect: 'none',
                      cursor: 'pointer',
                      paddingLeft: 12,
                      paddingRight: 12,
                      color: '#484f58',
                      width: 48,
                      minWidth: 48,
                      textAlign: 'right',
                      verticalAlign: 'top',
                      lineHeight: '20px',
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    {lineNum}
                  </td>
                  <td
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 2,
                      paddingBottom: 2,
                      whiteSpace: 'pre',
                      color: '#c9d1d9',
                      lineHeight: '20px',
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
