'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'

type Message = { role: 'user' | 'assistant'; content: string }

const quick = ['Which items need restocking now?', 'Where am I losing money?', 'What should I reorder today?', 'Show top sellers', 'Predict next week demand']

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello. I am ShelfMind AI, your retail decision co-pilot. Ask about inventory, sales, forecasts, reorder risk, or margin leakage.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(question: string) {
    if (!question.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setInput('')
    setLoading(true)
    const response = await api.chat(question, sessionId)
    setMessages(prev => [...prev, { role: 'assistant', content: response.answer }])
    setLoading(false)
  }

  return (
    <div className="grid min-h-[calc(100vh-140px)] gap-6 xl:grid-cols-[1fr_360px]">
      <GlassCard glow="cyan" className="flex min-h-[680px] flex-col p-5" hover={false}>
        <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="rounded-2xl border border-brand-glow/30 bg-brand-glow/10 p-3 text-brand-glow"><Bot /></div>
          <div>
            <h2 className="font-bold text-white">Conversational Inventory AI</h2>
            <p className="text-sm text-slate-400">Natural language over live inventory context</p>
          </div>
        </div>
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-3xl border px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-tr-md border-brand-glow/30 bg-brand-glow/15 text-white' : 'rounded-tl-md border-white/10 bg-white/[.045] text-slate-200'}`}>
                {message.content}
              </div>
            </motion.div>
          ))}
          {loading && <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-brand-glow"><Sparkles size={16} /> Thinking through stock velocity...</div>}
          <div ref={bottom} />
        </div>
        <div className="mt-4 flex gap-3">
          <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send(input)} placeholder="Ask about stockouts, ROI, orders..." className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-brand-glow/40" />
          <button onClick={() => send(input)} className="rounded-2xl border border-brand-glow/30 bg-brand-glow/10 px-5 py-3 font-bold text-brand-glow hover:bg-brand-glow/20"><Send size={18} /></button>
        </div>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard glow="purple" className="p-5" hover={false}>
          <h3 className="font-bold text-white">Quick Questions</h3>
          <div className="mt-4 space-y-2">
            {quick.map(question => (
              <button key={question} onClick={() => send(question)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-left text-sm text-slate-300 hover:border-brand-purple/40 hover:text-white">
                {question}
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard glow="green" className="p-5" hover={false}>
          <h3 className="font-bold text-white">Live Context</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <div className="flex justify-between"><span>Products tracked</span><b className="text-brand-green">20</b></div>
            <div className="flex justify-between"><span>Sales records</span><b className="text-brand-green">3,500+</b></div>
            <div className="flex justify-between"><span>Forecast horizon</span><b className="text-brand-glow">30 days</b></div>
            <div className="flex justify-between"><span>Mode</span><b className="text-brand-purple">Local-first</b></div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
