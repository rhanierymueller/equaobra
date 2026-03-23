'use client'

import { useState } from 'react'

import { useWorkLogs } from '../../hooks/useWorkLogs'

import { useNotifications } from '@/src/features/notifications/hooks/useNotifications'
import { PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Team } from '@/src/types/team.types'
import { formatDate } from '@/src/utils/date'

type ConfirmFn = (cfg: {
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}) => void

type DateRange = '7d' | '14d' | '30d' | 'month'
const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '7d': '7d',
  '14d': '14d',
  '30d': '30d',
  month: 'Mês',
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function getDays(range: DateRange): string[] {
  if (range === 'month') {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1)
      return d.toISOString().split('T')[0]
    })
  }
  const count = range === '7d' ? 7 : range === '14d' ? 14 : 30
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (count - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

function shortDay(iso: string) {
  return iso.split('-')[2]
}
function formatShortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

const WEEK_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
function weekday(iso: string) {
  return WEEK_LABELS[new Date(iso + 'T12:00:00').getDay()]
}

function labelStep(total: number): number {
  if (total <= 7) return 1
  if (total <= 14) return 2
  return 5
}

interface ChartSeries {
  memberId: string
  color: string
  data: Record<string, number>
}

function BarChart({ days, series }: { days: string[]; series: ChartSeries[] }) {
  const [hoverDay, setHoverDay] = useState<string | null>(null)

  const BAR_W = days.length <= 7 ? 22 : days.length <= 14 ? 18 : 14
  const BAR_GAP = 2
  const GROUP_GAP = days.length <= 7 ? 14 : 8
  const GROUP_W = series.length * BAR_W + (series.length - 1) * BAR_GAP + GROUP_GAP
  const SIDE_PAD = 10
  const svgW = days.length * GROUP_W + SIDE_PAD * 2
  const H = 80
  const LABEL_H = 18
  const step = labelStep(days.length)

  const maxVal = Math.max(1, ...series.flatMap((s) => days.map((d) => s.data[d] ?? 0)))
  const hasAnyData = series.some((s) => days.some((d) => (s.data[d] ?? 0) > 0))

  if (!hasAnyData) {
    return (
      <div
        style={{
          height: H + LABEL_H + 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,240,235,0.12)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <rect x="3" y="12" width="4" height="9" />
          <rect x="10" y="7" width="4" height="14" />
          <rect x="17" y="3" width="4" height="18" />
        </svg>
        <p style={{ fontSize: 11, color: 'rgba(245,240,235,0.25)' }}>Nenhum registro no período</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <svg width={svgW} height={H + LABEL_H} style={{ display: 'block', minWidth: svgW }}>
          {[0.5, 1].map((f) => (
            <line
              key={f}
              x1={SIDE_PAD}
              y1={H - H * f}
              x2={svgW - SIDE_PAD}
              y2={H - H * f}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          ))}

          {days.map((day, di) => {
            const gx = SIDE_PAD + di * GROUP_W
            const isHover = hoverDay === day
            const showLabel = di % step === 0 || di === days.length - 1

            return (
              <g
                key={day}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverDay(day)}
                onMouseLeave={() => setHoverDay(null)}
              >
                {isHover && (
                  <rect
                    x={gx - 3}
                    y={2}
                    width={GROUP_W - GROUP_GAP + 6}
                    height={H - 2}
                    fill="rgba(255,255,255,0.04)"
                    rx={4}
                  />
                )}
                {series.map((s, si) => {
                  const val = s.data[day] ?? 0
                  const bH = val === 0 ? 1.5 : Math.max(4, (val / maxVal) * (H - 8))
                  const x = gx + si * (BAR_W + BAR_GAP)
                  return (
                    <rect
                      key={s.memberId}
                      x={x}
                      y={H - bH}
                      width={BAR_W}
                      height={bH}
                      rx={3}
                      fill={val === 0 ? 'rgba(255,255,255,0.05)' : s.color}
                      opacity={val === 0 ? 1 : isHover ? 1 : 0.75}
                    />
                  )
                })}
                {(showLabel || isHover) && (
                  <text
                    x={gx + (series.length * (BAR_W + BAR_GAP) - BAR_GAP) / 2}
                    y={H + 13}
                    textAnchor="middle"
                    fontSize={9}
                    fill={isHover ? 'rgba(245,240,235,0.7)' : 'rgba(245,240,235,0.25)'}
                  >
                    {days.length <= 7 ? weekday(day) : shortDay(day)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div style={{ height: 16, marginTop: 3 }}>
        {hoverDay &&
          (() => {
            const total = series.reduce((acc, s) => acc + (s.data[hoverDay] ?? 0), 0)
            return (
              <span style={{ fontSize: 11 }}>
                <span style={{ color: 'rgba(245,240,235,0.35)' }}>{formatDate(hoverDay)} — </span>
                <strong
                  style={{ color: total > 0 ? 'var(--color-primary)' : 'var(--color-text-faint)' }}
                >
                  {total > 0 ? `${total}h` : 'sem registro'}
                </strong>
              </span>
            )
          })()}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  progress,
}: {
  label: string
  value: string
  color?: string
  progress?: number
}) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p style={{ fontSize: 10, color: 'rgba(245,240,235,0.35)', marginBottom: 3 }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: color ?? 'rgba(245,240,235,0.3)' }}>
        {value}
      </p>
      {progress !== undefined && (
        <div
          style={{
            height: 3,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 99,
            marginTop: 5,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 99,
              width: `${Math.min(100, progress)}%`,
              background:
                progress >= 100
                  ? 'var(--color-success)'
                  : progress > 60
                    ? 'var(--color-star)'
                    : 'var(--color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

interface WorkLogSectionProps {
  team: Team
  currentUser: { id: string; name: string }
  isLeader: boolean
  leaderId: string
  onRequestConfirm: ConfirmFn
}

export function WorkLogSection({
  team,
  currentUser,
  isLeader,
  leaderId,
  onRequestConfirm,
}: WorkLogSectionProps) {
  const { logs, addLog, removeLog, getLogsForMember, getTotalHours } = useWorkLogs(team.id)
  const { push } = useNotifications(currentUser.id)

  const [view, setView] = useState<'my' | 'team'>('my')
  const [selectedMemberId, setSelectedMemberId] = useState(team.members[0]?.professionalId ?? '')
  const [form, setForm] = useState({ date: today(), hours: '', description: '' })
  const [formError, setFormError] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [requestedLogs, setRequestedLogs] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState<DateRange>('14d')

  const days = getDays(dateRange)
  const displayId = isLeader && view === 'team' ? selectedMemberId : currentUser.id
  const displayName =
    team.members.find((m) => m.professionalId === displayId)?.name ?? currentUser.name
  const displayLogs = getLogsForMember(displayId)

  const weekStart = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().split('T')[0]
  })()
  const weekHours = displayLogs.filter((l) => l.date >= weekStart).reduce((s, l) => s + l.hours, 0)
  const totalHours = displayLogs.reduce((s, l) => s + l.hours, 0)
  const goalHours = team.estimatedDays * 8
  const progressPct = goalHours > 0 ? (totalHours / goalHours) * 100 : 0

  function handleAdd() {
    const h = Number(form.hours)
    if (!form.date) {
      setFormError('Selecione uma data')
      return
    }
    if (!h || h <= 0 || h > 24) {
      setFormError('Horas inválidas (0.5–24)')
      return
    }
    setFormError('')
    const targetId = isLeader && view === 'team' ? selectedMemberId : currentUser.id
    const targetName =
      team.members.find((m) => m.professionalId === targetId)?.name ?? currentUser.name
    const doAdd = () => {
      addLog(targetId, targetName, form.date, h, form.description || undefined)
      if (isLeader && targetId !== currentUser.id) {
        push(
          'log_edited',
          targetId,
          team.id,
          team.name,
          currentUser.id,
          currentUser.name,
          `O líder ${currentUser.name.split(' ')[0]} registrou ${h}h para você em ${formatShortDate(form.date)}.`,
          { logDate: form.date, logHours: h },
        )
      }
      setForm((f) => ({ ...f, hours: '', description: '' }))
    }
    onRequestConfirm({
      title: 'Registrar horas?',
      description: `${h}h em ${formatShortDate(form.date)}${form.description ? ` — "${form.description}"` : ''}${isLeader && targetId !== currentUser.id ? ` para ${targetName.split(' ')[0]}` : ''}.`,
      confirmLabel: 'Registrar',
      variant: 'info',
      onConfirm: doAdd,
    })
  }

  function handleLeaderDelete(
    logId: string,
    logOwnerId: string,
    logDate: string,
    logHours: number,
  ) {
    onRequestConfirm({
      title: 'Excluir registro?',
      description: `O registro de ${logHours}h do dia ${formatShortDate(logDate)} será removido permanentemente${logOwnerId !== currentUser.id ? ' e o membro será notificado' : ''}.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        removeLog(logId)
        if (logOwnerId !== currentUser.id) {
          push(
            'log_deleted',
            logOwnerId,
            team.id,
            team.name,
            currentUser.id,
            currentUser.name,
            `O líder removeu seu registro de ${logHours}h do dia ${formatShortDate(logDate)}.`,
            { logId, logDate, logHours },
          )
        }
      },
    })
  }

  function handleRequestDelete(logId: string, logDate: string, logHours: number) {
    setRequestedLogs((prev) => new Set([...prev, logId]))
    push(
      'log_delete_request',
      leaderId,
      team.id,
      team.name,
      currentUser.id,
      currentUser.name,
      `${currentUser.name.split(' ')[0]} solicita excluir o registro de ${logHours}h do dia ${formatShortDate(logDate)}.`,
      { logId, logDate, logHours },
    )
  }

  const chartSeries: ChartSeries[] = (() => {
    if (!isLeader || view === 'my') {
      const data: Record<string, number> = {}
      for (const l of getLogsForMember(currentUser.id)) data[l.date] = (data[l.date] ?? 0) + l.hours
      const color =
        PROFESSION_COLORS[
          team.members.find((m) => m.professionalId === currentUser.id)
            ?.profession as keyof typeof PROFESSION_COLORS
        ] ?? 'var(--color-primary)'
      return [{ memberId: currentUser.id, color, data }]
    }
    return team.members.map((m) => {
      const data: Record<string, number> = {}
      for (const l of getLogsForMember(m.professionalId))
        data[l.date] = (data[l.date] ?? 0) + l.hours
      const color =
        PROFESSION_COLORS[m.profession as keyof typeof PROFESSION_COLORS] ?? 'var(--color-primary)'
      return { memberId: m.professionalId, color, data }
    })
  })()

  return (
    <div
      className="rounded-2xl"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(13,12,11,0.6)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-sm font-bold text-white">Registro de Horas</span>
          <span
            style={{
              fontSize: 10,
              padding: '1px 7px',
              borderRadius: 99,
              background: 'rgba(224,123,42,0.1)',
              color: 'rgba(224,123,42,0.7)',
              border: '1px solid rgba(224,123,42,0.2)',
            }}
          >
            opcional
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            color: 'rgba(245,240,235,0.25)',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px 16px' }}>
          {isLeader && (
            <div
              className="flex mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}
            >
              {(['my', 'team'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
                  style={{
                    background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: view === v ? 'var(--color-text)' : 'rgba(245,240,235,0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {v === 'my' ? 'Minhas horas' : 'Equipe toda'}
                </button>
              ))}
            </div>
          )}

          {isLeader && view === 'team' && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {team.members.map((m) => {
                const color =
                  PROFESSION_COLORS[m.profession as keyof typeof PROFESSION_COLORS] ??
                  'var(--color-primary)'
                const total = getTotalHours(m.professionalId)
                const sel = selectedMemberId === m.professionalId
                return (
                  <button
                    key={m.professionalId}
                    onClick={() => setSelectedMemberId(m.professionalId)}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: sel ? `${color}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${sel ? color + '50' : 'rgba(255,255,255,0.07)'}`,
                      color: sel ? color : 'rgba(245,240,235,0.45)',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                        opacity: sel ? 1 : 0.4,
                      }}
                    />
                    {m.name.split(' ')[0]}
                    {total > 0 && <span style={{ opacity: 0.65, marginLeft: 2 }}>{total}h</span>}
                  </button>
                )
              })}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard
              label="Últimos 7 dias"
              value={`${weekHours}h`}
              color={weekHours > 0 ? 'var(--color-primary)' : undefined}
            />
            <StatCard
              label="Total registrado"
              value={`${totalHours}h`}
              color={totalHours > 0 ? 'var(--color-star)' : undefined}
              progress={progressPct}
            />
            <StatCard label="Meta da obra" value={`${goalHours}h`} color="var(--color-success)" />
          </div>

          <div
            className="mb-3"
            style={{
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 12,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span
                style={{
                  fontSize: 10,
                  color: 'rgba(245,240,235,0.3)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Horas por dia
              </span>
              <div className="flex gap-1">
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: dateRange === r ? 'var(--color-primary)' : 'transparent',
                      color: dateRange === r ? 'white' : 'rgba(245,240,235,0.3)',
                      border: `1px solid ${dateRange === r ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer',
                      fontWeight: dateRange === r ? 700 : 400,
                    }}
                  >
                    {DATE_RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
            <BarChart days={days} series={chartSeries} />
            {isLeader && view === 'team' && (
              <div
                className="flex flex-wrap gap-3 mt-2 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                {team.members.map((m) => {
                  const color =
                    PROFESSION_COLORS[m.profession as keyof typeof PROFESSION_COLORS] ??
                    'var(--color-primary)'
                  return (
                    <div
                      key={m.professionalId}
                      className="flex items-center gap-1.5"
                      style={{ fontSize: 10, color: 'rgba(245,240,235,0.4)' }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 2,
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      {m.name.split(' ')[0]}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div
            className="mb-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(245,240,235,0.45)',
                marginBottom: 8,
              }}
            >
              {isLeader && view === 'team'
                ? `Registrar para ${team.members.find((m) => m.professionalId === selectedMemberId)?.name.split(' ')[0] ?? '...'}`
                : 'Registrar horas'}
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col gap-1" style={{ width: 130 }}>
                <label style={{ fontSize: 10, color: 'rgba(245,240,235,0.35)' }}>Data</label>
                <input
                  type="date"
                  value={form.date}
                  max={today()}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--color-text)',
                    borderRadius: 8,
                    padding: '5px 8px',
                    fontSize: 11,
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1" style={{ width: 60 }}>
                <label style={{ fontSize: 10, color: 'rgba(245,240,235,0.35)' }}>Horas</label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={form.hours}
                  placeholder="8"
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--color-text)',
                    borderRadius: 8,
                    padding: '5px 8px',
                    fontSize: 11,
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
              <input
                type="text"
                value={form.description}
                placeholder="Descrição (opcional)"
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'var(--color-text)',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: 11,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                + Registrar
              </button>
            </div>
            {formError && (
              <p style={{ fontSize: 11, color: 'var(--color-danger-light)', marginTop: 6 }}>
                {formError}
              </p>
            )}
          </div>

          {displayLogs.length > 0 ? (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(245,240,235,0.35)',
                  marginBottom: 6,
                }}
              >
                {isLeader && view === 'team'
                  ? `Registros — ${displayName.split(' ')[0]}`
                  : 'Meus registros'}
              </p>
              <div className="flex flex-col gap-1">
                {[...displayLogs]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 8)
                  .map((log) => {
                    const requested = requestedLogs.has(log.id)
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            minWidth: 28,
                          }}
                        >
                          {log.hours}h
                        </span>
                        <span
                          style={{ fontSize: 10, color: 'rgba(245,240,235,0.3)', minWidth: 42 }}
                        >
                          {formatShortDate(log.date)}
                        </span>
                        <span
                          className="flex-1 truncate"
                          style={{ fontSize: 11, color: 'rgba(245,240,235,0.45)' }}
                        >
                          {log.description ?? '—'}
                        </span>
                        {isLeader ? (
                          <button
                            onClick={() =>
                              handleLeaderDelete(log.id, log.memberId, log.date, log.hours)
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'rgba(245,240,235,0.2)',
                              padding: '0 2px',
                              flexShrink: 0,
                              lineHeight: 1,
                            }}
                          >
                            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 2L10 10M10 2L2 10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              !requested && handleRequestDelete(log.id, log.date, log.hours)
                            }
                            disabled={requested}
                            style={{
                              fontSize: 10,
                              padding: '2px 7px',
                              borderRadius: 6,
                              flexShrink: 0,
                              background: requested
                                ? 'rgba(76,175,80,0.1)'
                                : 'rgba(255,255,255,0.05)',
                              color: requested ? 'var(--color-success)' : 'rgba(245,240,235,0.3)',
                              border: `1px solid ${requested ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.07)'}`,
                              cursor: requested ? 'default' : 'pointer',
                            }}
                          >
                            {requested ? '✓ Solicitado' : 'Solicitar exclusão'}
                          </button>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: 11,
                color: 'rgba(245,240,235,0.25)',
                textAlign: 'center',
                padding: '8px 0',
              }}
            >
              Nenhum registro ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
