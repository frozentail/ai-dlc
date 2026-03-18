import { useEffect, useRef, useState } from 'react'
import { getSSEUrl } from '../api/client'

export function useSSE(sessionId, token) {
  const [lastEvent, setLastEvent] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const esRef = useRef(null)

  useEffect(() => {
    if (!sessionId || !token) return

    // EventSource는 헤더 미지원 → token을 query param으로 전달
    const url = `${getSSEUrl(sessionId)}?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setIsConnected(true)
    es.onerror = () => setIsConnected(false)

    es.addEventListener('order_status_updated', (e) => {
      setLastEvent({ type: 'order_status_updated', data: JSON.parse(e.data) })
    })

    es.addEventListener('new_order', (e) => {
      setLastEvent({ type: 'new_order', data: JSON.parse(e.data) })
    })

    return () => {
      es.close()
      setIsConnected(false)
    }
  }, [sessionId, token])

  return { lastEvent, isConnected }
}
