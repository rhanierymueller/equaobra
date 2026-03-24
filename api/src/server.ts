import 'dotenv/config'
import cors from 'cors'
import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import authRoutes from './routes/auth'
import chatsRoutes from './routes/chats'
import interestsRoutes from './routes/interests'
import notificationsRoutes from './routes/notifications'
import opportunitiesRoutes from './routes/opportunities'
import teamsRoutes from './routes/teams'
import usersRoutes from './routes/users'
import worklogsRoutes from './routes/worklogs'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET deve ter pelo menos 32 caracteres.')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT ?? 3001

const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL].filter(
  Boolean,
) as string[]

app.use(helmet())
app.use(
  cors({
    origin(origin, cb) {
      if (!origin && process.env.NODE_ENV === 'production')
        return cb(new Error('Bloqueado por CORS'))
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error('Bloqueado por CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', globalLimiter)
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/opportunities', opportunitiesRoutes)
app.use('/api/teams', teamsRoutes)
app.use('/api/teams/:id/worklogs', worklogsRoutes)
app.use('/api/interests', interestsRoutes)
app.use('/api/chats', chatsRoutes)
app.use('/api/notifications', notificationsRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((_, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.warn(`EquaObra API rodando em http://localhost:${PORT}`)
})

export default app
