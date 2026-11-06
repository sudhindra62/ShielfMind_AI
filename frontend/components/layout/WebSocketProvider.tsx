'use client'

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

type Message = { type: string; [key: string]: unknown }

const WebSocketContext = createContext({
  isConnected: false,
  lastMessage: null as Message | null,
  send: (_data: object) => {}
})

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const ws = useRef<WebSocket | null>(null)
  const queue = useRef<Message[]>([])
  const flushTimer = useRef<ReturnType<typeof setTimeout>>()
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<Message | null>(null)

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws')
        ws.current.onopen = () => setIsConnected(true)
        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data) as Message
          queue.current.push(message)
          clearTimeout(flushTimer.current)
          flushTimer.current = setTimeout(() => {
            const latest = queue.current.at(-1) || null
            queue.current = []
            setLastMessage(latest)
            if (latest?.type === 'alert.created') toast.error(String(latest.message || 'New alert received'))
            if (latest?.type === 'scan.completed') toast.success('Shelf scan completed')
            if (latest?.type === 'inventory.updated') toast.success('Inventory updated live')
          }, 140)
        }
        ws.current.onclose = () => {
          setIsConnected(false)
          reconnectTimer.current = setTimeout(connect, 3000)
        }
        ws.current.onerror = () => ws.current?.close()
      } catch {
        setIsConnected(false)
      }
    }
    connect()
    return () => {
      clearTimeout(flushTimer.current)
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [])

  const send = (data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(data))
  }

  return <WebSocketContext.Provider value={{ isConnected, lastMessage, send }}>{children}</WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)
