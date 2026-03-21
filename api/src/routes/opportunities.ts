import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const p = (v: string | string[]) => String(v)

const oppSchema = z.object({
  contractorName: z.string(),
  companyName: z.string().optional(),
  avatarInitials: z.string(),
  obraDescription: z.string().min(10),
  obraLocation: z.string().min(2),
  lat: z.number().optional(),
  lng: z.number().optional(),
  obraStart: z.string().optional(),
  obraDuration: z.string().optional(),
  lookingForProfessions: z.array(z.string()).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
})

function deserializeOpp(opp: {
  id: string; contractorId: string; contractorName: string; companyName: string | null
  avatarInitials: string; obraDescription: string; obraLocation: string
  lat: number | null; lng: number | null; obraStart: string | null; obraDuration: string | null
  lookingForProfessions: string; contactEmail: string; contactPhone: string | null
  active: boolean; createdAt: Date; updatedAt: Date
}) {
  return { ...opp, lookingForProfessions: JSON.parse(opp.lookingForProfessions) as string[] }
}

// ── GET /api/opportunities ────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { city, profession } = req.query

  const opps = await prisma.opportunity.findMany({
    where: {
      active: true,
      ...(profession ? { lookingForProfessions: { contains: p(profession as string) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const cityLc = city ? p(city as string).toLowerCase() : null
  const filtered = cityLc ? opps.filter(o => o.obraLocation.toLowerCase().includes(cityLc)) : opps

  res.json(filtered.map(deserializeOpp))
})

// ── GET /api/opportunities/mine ───────────────────────────────────────────────

router.get('/mine', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const opps = await prisma.opportunity.findMany({
    where: { contractorId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(opps.map(deserializeOpp))
})

// ── GET /api/opportunities/:id ────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const opp = await prisma.opportunity.findUnique({ where: { id: p(req.params.id) } })
  if (!opp) { res.status(404).json({ error: 'Oportunidade não encontrada' }); return }
  res.json(deserializeOpp(opp))
})

// ── POST /api/opportunities ───────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = oppSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const data = parsed.data
  const opp = await prisma.opportunity.create({
    data: {
      contractorId: req.user!.userId,
      contractorName: data.contractorName,
      companyName: data.companyName,
      avatarInitials: data.avatarInitials,
      obraDescription: data.obraDescription,
      obraLocation: data.obraLocation,
      lat: data.lat,
      lng: data.lng,
      obraStart: data.obraStart,
      obraDuration: data.obraDuration,
      lookingForProfessions: JSON.stringify(data.lookingForProfessions),
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    },
  })

  res.status(201).json(deserializeOpp(opp))
})

// ── PATCH /api/opportunities/:id ──────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const opp = await prisma.opportunity.findUnique({ where: { id: p(req.params.id) } })
  if (!opp) { res.status(404).json({ error: 'Oportunidade não encontrada' }); return }
  if (opp.contractorId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  const partial = oppSchema.partial().extend({ active: z.boolean().optional() }).safeParse(req.body)
  if (!partial.success) {
    res.status(400).json({ error: 'Dados inválidos', details: partial.error.flatten() })
    return
  }

  const updated = await prisma.opportunity.update({
    where: { id: p(req.params.id) },
    data: {
      ...partial.data,
      lookingForProfessions: partial.data.lookingForProfessions
        ? JSON.stringify(partial.data.lookingForProfessions)
        : undefined,
    },
  })

  res.json(deserializeOpp(updated))
})

// ── DELETE /api/opportunities/:id ─────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const opp = await prisma.opportunity.findUnique({ where: { id: p(req.params.id) } })
  if (!opp) { res.status(404).json({ error: 'Oportunidade não encontrada' }); return }
  if (opp.contractorId !== req.user!.userId) { res.status(403).json({ error: 'Sem permissão' }); return }

  await prisma.opportunity.delete({ where: { id: p(req.params.id) } })
  res.status(204).send()
})

export default router
