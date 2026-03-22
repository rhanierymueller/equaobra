import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import opportunitiesRoutes from './routes/opportunities'
import teamsRoutes from './routes/teams'
import worklogsRoutes from './routes/worklogs'
import interestsRoutes from './routes/interests'
import chatsRoutes from './routes/chats'
import notificationsRoutes from './routes/notifications'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
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

app.listen(PORT, () => {
  console.log(`EquaObra API rodando em http://localhost:${PORT}`)
})

export default app
