import { useEffect, useRef, useState } from 'react'
import { getSSEUrl } from '../api/client'

export function useSSE(token) {
  const [lastEvent, setLastEvent] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const esRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const url = `${getSSEUrl()}?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setIsConnected(true)
    es.onerror = () => setIsConnected(false)

    es.addEventListener('new_order', (e) => {
      setLastEvent({ type: 'new_order', data: JSON.parse(e.data) })
    })

    es.addEventListener('order_status_changed', (e) => {
      setLastEvent({ type: 'order_status_changed', data: JSON.parse(e.data) })
    })

    return () => {
      es.close()
      setIsConnected(false)
    }
  }, [token])

  return { lastEvent, isConnected }
}
