'use client'

import { useMemo, useState } from 'react'
import { Camera, ImagePlus, ScanLine, Sparkles, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'
import { NeonButton } from '@/components/ui/NeonButton'
import { GlowBadge } from '@/components/ui/GlowBadge'

type Result = {
  detected_products: Record<string, number>
  scan_accuracy: number
  empty_gaps: number
  model: string
}

const recommendations = [
  'Restock Maggi before evening rush; visible shelf count is below safe cover.',
  'Move Parle-G to the front bay; it is high velocity and underfilled.',
  'Fill the right-side empty gap with Tata Tea or snacks to reduce lost impulse sales.'
]

export default function ScannerPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [scanning, setScanning] = useState(false)

  const boxes = useMemo(() => [
    { left: '12%', top: '20%', width: '24%', height: '18%', label: 'Parle-G', color: 'border-brand-glow' },
    { left: '48%', top: '26%', width: '19%', height: '16%', label: 'Maggi', color: 'border-brand-red' },
    { left: '22%', top: '58%', width: '22%', height: '17%', label: 'Amul', color: 'border-brand-green' },
    { left: '66%', top: '54%', width: '20%', height: '18%', label: 'Gap', color: 'border-brand-gold' }
  ], [])

  async function onFile(file?: File) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setScanning(true)
    const response = await api.scanShelfImage(file)
    setResult(response)
    setScanning(false)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <GlassCard glow="cyan" className="min-h-[680px] p-5" hover={false}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Shelf Vision AI</h2>
            <p className="text-sm text-slate-400">Upload shelf photos and review detected SKUs with bounding boxes.</p>
          </div>
          <div className="rounded-full border border-brand-glow/30 bg-brand-glow/10 px-3 py-1 text-xs font-bold text-brand-glow">Local model</div>
        </div>

        <label className="group relative flex min-h-[520px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-brand-glow/35 bg-white/[.03]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Shelf preview" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : (
            <div className="text-center">
              <ImagePlus className="mx-auto text-brand-glow" size={52} />
              <p className="mt-4 text-lg font-bold text-white">Drop a shelf image here</p>
              <p className="mt-1 text-sm text-slate-400">or click to run the scanner workflow</p>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
          {preview && boxes.map((box, index) => (
            <motion.div
              key={box.label}
              initial={{ opacity: 0, scale: .8 }}
              animate={{ opacity: result ? 1 : .35, scale: 1 }}
              transition={{ delay: index * .12 }}
              className={`absolute rounded-xl border-2 ${box.color} bg-black/20 backdrop-blur-[1px]`}
              style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
            >
              <span className="absolute -top-7 left-0 rounded-full border border-white/10 bg-brand-bg/80 px-2 py-1 text-xs font-bold text-white">{box.label}</span>
            </motion.div>
          ))}
          {scanning && <div className="scan-overlay absolute inset-x-0 top-0 animate-scan-line" />}
        </label>
      </GlassCard>

      <div className="space-y-5">
        <GlassCard glow="purple" className="p-5" hover={false}>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-brand-purple/30 bg-brand-purple/10 p-3 text-brand-purple"><Camera size={22} /></div>
            <div>
              <h3 className="font-bold text-white">Scanner Status</h3>
              <p className="text-sm text-slate-400">{scanning ? 'Analyzing shelf geometry' : result ? 'Scan complete' : 'Awaiting image'}</p>
            </div>
          </div>
          <button onClick={() => setResult({ detected_products: { 'Parle-G': 14, Maggi: 6, Amul: 9, 'Tata Tea': 12 }, scan_accuracy: .88, empty_gaps: 3, model: 'local-demo-vision' })} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-glow/30 bg-brand-glow/10 px-4 py-3 text-sm font-bold text-brand-glow hover:bg-brand-glow/20">
            <Sparkles size={17} /> Use Demo Scan
          </button>
        </GlassCard>

        {result && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <GlassCard glow="cyan" className="p-4 text-center"><ScanLine className="mx-auto text-brand-glow" /><b className="mt-2 block text-2xl text-white">{Object.keys(result.detected_products).length}</b><span className="text-xs text-slate-500">SKUs</span></GlassCard>
              <GlassCard glow="red" className="p-4 text-center"><Upload className="mx-auto text-brand-red" /><b className="mt-2 block text-2xl text-white">{result.empty_gaps}</b><span className="text-xs text-slate-500">Gaps</span></GlassCard>
              <GlassCard glow="green" className="p-4 text-center"><Sparkles className="mx-auto text-brand-green" /><b className="mt-2 block text-2xl text-white">{Math.round(result.scan_accuracy * 100)}%</b><span className="text-xs text-slate-500">Accuracy</span></GlassCard>
            </div>
            <GlassCard glow="cyan" className="p-5" hover={false}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-white">Detected Products</h3>
                <GlowBadge tone="cyan">{result.model}</GlowBadge>
              </div>
              <div className="mt-4 space-y-3">
                {Object.entries(result.detected_products).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] p-3">
                    <span className="text-sm font-semibold text-white">{name}</span>
                    <span className="rounded-full bg-brand-glow/10 px-3 py-1 text-sm font-bold text-brand-glow">{count} units</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard glow="gold" className="p-5" hover={false}>
              <h3 className="font-bold text-white">AI Recommendations</h3>
              <div className="mt-4 space-y-3">
                {recommendations.map((item, index) => (
                  <motion.div key={item} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .08 }} className="rounded-xl border border-white/10 bg-white/[.035] p-3 text-sm text-slate-300">
                    {item}
                  </motion.div>
                ))}
              </div>
              <NeonButton tone="gold" className="mt-4 w-full">Generate Reorder from Scan Results</NeonButton>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  )
}
