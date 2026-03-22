'use client'

import { useEffect, useRef } from 'react'

interface BuildingSpec {
  xRatio: number
  widthRatio: number
  maxHeightRatio: number
  startDelay: number
  windowCols: number
  windowRows: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

interface LandingCanvasProps {
  progressRef: React.MutableRefObject<number>
}

const GROUND_Y_RATIO = 0.82

const BUILDINGS: BuildingSpec[] = [
  {
    xRatio: 0.0,
    widthRatio: 0.055,
    maxHeightRatio: 0.28,
    startDelay: 0.02,
    windowCols: 2,
    windowRows: 5,
  },
  {
    xRatio: 0.07,
    widthRatio: 0.075,
    maxHeightRatio: 0.42,
    startDelay: 0.06,
    windowCols: 2,
    windowRows: 7,
  },
  {
    xRatio: 0.16,
    widthRatio: 0.09,
    maxHeightRatio: 0.54,
    startDelay: 0.1,
    windowCols: 3,
    windowRows: 9,
  },
  {
    xRatio: 0.27,
    widthRatio: 0.108,
    maxHeightRatio: 0.65,
    startDelay: 0.14,
    windowCols: 3,
    windowRows: 11,
  },
  {
    xRatio: 0.4,
    widthRatio: 0.125,
    maxHeightRatio: 0.79,
    startDelay: 0.2,
    windowCols: 4,
    windowRows: 14,
  },
  {
    xRatio: 0.55,
    widthRatio: 0.102,
    maxHeightRatio: 0.61,
    startDelay: 0.16,
    windowCols: 3,
    windowRows: 10,
  },
  {
    xRatio: 0.67,
    widthRatio: 0.085,
    maxHeightRatio: 0.46,
    startDelay: 0.11,
    windowCols: 3,
    windowRows: 8,
  },
  {
    xRatio: 0.77,
    widthRatio: 0.075,
    maxHeightRatio: 0.35,
    startDelay: 0.07,
    windowCols: 2,
    windowRows: 6,
  },
  {
    xRatio: 0.87,
    widthRatio: 0.06,
    maxHeightRatio: 0.25,
    startDelay: 0.03,
    windowCols: 2,
    windowRows: 4,
  },
  {
    xRatio: 0.94,
    widthRatio: 0.06,
    maxHeightRatio: 0.31,
    startDelay: 0.01,
    windowCols: 2,
    windowRows: 5,
  },
]

const BUILDING_COLORS = ['#161412', '#1D1B18', '#23201D', '#2A2724']

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function localProgress(global: number, spec: BuildingSpec): number {
  return Math.max(0, Math.min(1, (global - spec.startDelay) / (1 - spec.startDelay)))
}

function drawSky(ctx: CanvasRenderingContext2D, W: number, H: number, progress: number): void {
  const b = progress * 0.28
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(
    0,
    `rgb(${Math.round(10 + b * 28)},${Math.round(9 + b * 18)},${Math.round(8 + b * 14)})`,
  )
  grad.addColorStop(
    0.72,
    `rgb(${Math.round(18 + b * 48)},${Math.round(14 + b * 28)},${Math.round(10 + b * 18)})`,
  )
  grad.addColorStop(
    1,
    `rgb(${Math.round(28 + b * 58)},${Math.round(18 + b * 32)},${Math.round(10 + b * 22)})`,
  )
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,
  time: number,
): void {
  const alpha = Math.max(0, 1 - progress / 0.75)
  if (alpha <= 0) return
  const groundY = H * GROUND_Y_RATIO
  for (let i = 0; i < 110; i++) {
    const sx = (i * 131.7 + 40) % W
    const sy = (i * 79.3 + 10) % (groundY * 0.78)
    const size = i % 6 === 0 ? 1.6 : 0.75
    const twinkle = 0.35 + 0.45 * Math.sin(time * 0.0008 + i * 1.3)
    ctx.beginPath()
    ctx.arc(sx, sy, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 238, 210, ${alpha * twinkle})`
    ctx.fill()
  }
}

function drawGround(ctx: CanvasRenderingContext2D, W: number, H: number, progress: number): void {
  const groundY = H * GROUND_Y_RATIO
  const grad = ctx.createLinearGradient(0, groundY, 0, H)
  grad.addColorStop(0, '#181512')
  grad.addColorStop(1, '#0C0B0A')
  ctx.fillStyle = grad
  ctx.fillRect(0, groundY, W, H - groundY)

  if (progress > 0.04) {
    const glowA = Math.min(1, (progress - 0.04) / 0.35)
    const glow = ctx.createLinearGradient(0, groundY - 4, 0, groundY + 22)
    glow.addColorStop(0, `rgba(224,123,42,${glowA * 0.85})`)
    glow.addColorStop(0.45, `rgba(224,123,42,${glowA * 0.25})`)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, groundY - 4, W, 26)
  }
}

function drawBuildings(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,
): void {
  const groundY = H * GROUND_Y_RATIO

  BUILDINGS.forEach((spec, idx) => {
    const lp = easeOutCubic(localProgress(progress, spec))
    if (lp <= 0) return

    const bx = spec.xRatio * W
    const bw = spec.widthRatio * W
    const fullH = spec.maxHeightRatio * H
    const bh = fullH * lp
    const by = groundY - bh
    const baseColor = BUILDING_COLORS[idx % BUILDING_COLORS.length]

    ctx.fillStyle = baseColor
    ctx.fillRect(bx, by, bw, bh)

    const sideGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0)
    sideGrad.addColorStop(0, 'rgba(0,0,0,0.32)')
    sideGrad.addColorStop(0.25, 'rgba(0,0,0,0)')
    sideGrad.addColorStop(0.75, 'rgba(0,0,0,0)')
    sideGrad.addColorStop(1, 'rgba(0,0,0,0.45)')
    ctx.fillStyle = sideGrad
    ctx.fillRect(bx, by, bw, bh)

    if (lp < 0.97) {
      const edgeA = 1 - lp / 0.97
      ctx.fillStyle = `rgba(224,123,42,${edgeA})`
      ctx.fillRect(bx, by, bw, 2.5)

      const topGlow = ctx.createLinearGradient(0, by - 18, 0, by + 6)
      topGlow.addColorStop(0, 'transparent')
      topGlow.addColorStop(1, `rgba(224,123,42,${edgeA * 0.45})`)
      ctx.fillStyle = topGlow
      ctx.fillRect(bx - 6, by - 18, bw + 12, 24)
    }

    if (lp > 0.22) {
      const winA = Math.min(1, (lp - 0.22) / 0.28)
      const hPad = bw * 0.09
      const wW = (bw - hPad * 2) / spec.windowCols - hPad * 0.4
      const wH = wW * 1.35

      for (let row = 0; row < spec.windowRows; row++) {
        const wy = by + bh - (row + 1) * (wH + bh * 0.022) - bh * 0.04
        if (wy < by || wy + wH > groundY) continue

        for (let col = 0; col < spec.windowCols; col++) {
          const wx = bx + hPad + col * ((bw - hPad * 2) / spec.windowCols)
          const hash = (idx * 37 + row * 19 + col * 11) % 16
          const isLit = hash < 11
          const isOrange = hash === 0

          if (!isLit) {
            ctx.fillStyle = `rgba(8,14,24,${winA * 0.9})`
          } else if (isOrange) {
            ctx.fillStyle = `rgba(224,123,42,${winA * 0.85})`
          } else {
            ctx.fillStyle = `rgba(255,200,120,${winA * 0.6})`
          }
          ctx.fillRect(wx, wy, wW, wH)
        }
      }
    }
  })
}

function drawCrane(ctx: CanvasRenderingContext2D, W: number, H: number, progress: number): void {
  if (progress < 0.04 || progress > 0.93) return

  const fadeIn = Math.min(1, (progress - 0.04) / 0.14)
  const fadeOut = Math.min(1, (0.93 - progress) / 0.1)
  const alpha = Math.min(fadeIn, fadeOut) * 0.72
  const groundY = H * GROUND_Y_RATIO

  const tallSpec = BUILDINGS[4]
  const tallLp = easeOutCubic(localProgress(progress, tallSpec))
  const craneTopY = groundY - tallLp * tallSpec.maxHeightRatio * H - 28
  const craneX = tallSpec.xRatio * W + tallSpec.widthRatio * W * 0.72

  ctx.strokeStyle = `rgba(175,158,138,${alpha})`
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(craneX, groundY)
  ctx.lineTo(craneX, craneTopY)
  ctx.stroke()

  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(craneX, craneTopY)
  ctx.lineTo(craneX + W * 0.13, craneTopY)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(craneX, craneTopY)
  ctx.lineTo(craneX - W * 0.05, craneTopY + 2)
  ctx.stroke()

  ctx.lineWidth = 1
  ctx.strokeStyle = `rgba(175,158,138,${alpha * 0.6})`
  ctx.beginPath()
  ctx.moveTo(craneX, craneTopY - 10)
  ctx.lineTo(craneX + W * 0.13, craneTopY)
  ctx.stroke()

  const hookX = craneX + W * 0.08
  ctx.lineWidth = 1
  ctx.strokeStyle = `rgba(175,158,138,${alpha * 0.5})`
  ctx.beginPath()
  ctx.moveTo(hookX, craneTopY)
  ctx.lineTo(hookX, craneTopY + H * 0.11)
  ctx.stroke()
}

function updateAndDrawSparks(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,
  sparks: Spark[],
): void {
  const groundY = H * GROUND_Y_RATIO

  if (progress > 0.07 && progress < 0.88) {
    const intensity = Math.sin(((progress - 0.07) / 0.81) * Math.PI)
    const count = Math.floor(intensity * 3)

    for (let i = 0; i < count; i++) {
      const randIdx = Math.floor(Math.random() * BUILDINGS.length)
      const spec = BUILDINGS[randIdx]
      const lp = easeOutCubic(localProgress(progress, spec))
      if (lp < 0.04 || lp > 0.96) continue

      sparks.push({
        x: spec.xRatio * W + spec.widthRatio * W * Math.random(),
        y: groundY - lp * spec.maxHeightRatio * H,
        vx: (Math.random() - 0.5) * 2.8,
        vy: -Math.random() * 4.5 - 0.8,
        life: 28 + Math.random() * 28,
        maxLife: 56,
        size: 0.7 + Math.random() * 1.9,
      })
    }
  }

  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]
    s.x += s.vx
    s.y += s.vy
    s.vy += 0.2
    s.vx *= 0.98
    s.life--

    if (s.life <= 0) {
      sparks.splice(i, 1)
      continue
    }

    const a = (s.life / s.maxLife) * 0.9
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,178,72,${a})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size * 3.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(224,123,42,${a * 0.18})`
    ctx.fill()
  }

  if (sparks.length > 220) sparks.splice(0, sparks.length - 220)
}

function drawVignette(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const grad = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.18, W / 2, H * 0.48, H * 0.9)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.68)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
}

export function LandingCanvas({ progressRef }: LandingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const render = (time: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height
      const p = progressRef.current

      drawSky(ctx, W, H, p)
      drawStars(ctx, W, H, p, time)
      drawGround(ctx, W, H, p)
      drawBuildings(ctx, W, H, p)
      drawCrane(ctx, W, H, p)
      updateAndDrawSparks(ctx, W, H, p, sparksRef.current)
      drawVignette(ctx, W, H)

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [progressRef])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
