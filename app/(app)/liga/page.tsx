'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface RankingEntry {
  pos: number
  name: string
  xp: number
  racha: number
  isMe: boolean
  isBot: boolean
  initials: string
  avatarColor: string
  ligaNivel: number
}

const BOT_NAMES = [
  'Carlos M.', 'Ana García', 'Pedro L.', 'María S.', 'Juan A.',
  'Laura P.', 'Miguel R.', 'Sara T.', 'David F.', 'Lucía B.',
  'Marcos V.', 'Elena C.', 'Álvaro N.', 'Carla D.', 'Javier H.',
  'Natalia E.', 'Diego K.', 'Sofía G.', 'Rubén I.', 'Marta J.',
  'Pablo O.', 'Isabel Q.', 'Sergio U.', 'Cristina W.', 'Adrián X.',
  'Beatriz Y.', 'Víctor Z.', 'Nuria AA.', 'Fernando BB.', 'Rocío CC.',
]

const AVATAR_COLORS = [
  '#00D47A', '#42A5F5', '#9945FF', '#F9A825', '#EF5350',
  '#26C6DA', '#66BB6A', '#FFA726', '#AB47BC', '#29B6F6',
]

const LIGA_NAMES = ['Novato', 'Aprendiz', 'Analista', 'Trader', 'Estratega', 'Gestor', 'Experto', 'Maestro', 'Élite', 'Leyenda']

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function getDaysUntilMonday(): number {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon...
  const daysUntil = day === 1 ? 7 : (8 - day) % 7
  return daysUntil === 0 ? 7 : daysUntil
}

export default function LigaPage() {
  const { data: session } = useSession()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'week' | 'history'>('week')
  const daysUntilReset = getDaysUntilMonday()

  const user = session?.user as Record<string, unknown> | undefined
  const userName = (user?.name as string) ?? 'Tú'
  const userXP = (user?.xp as number) ?? 0
  const userRacha = (user?.racha as number) ?? 0
  const userLigaNivel = (user?.liga_nivel as number) ?? 1

  useEffect(() => {
    let cancelled = false

    fetch('/api/liga/ranking')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.ranking) {
          setRanking(data.ranking)
        } else {
          buildLocalRanking()
        }
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        buildLocalRanking()
        setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildLocalRanking() {
    const entries: RankingEntry[] = []

    // Real user
    entries.push({
      pos: 0,
      name: userName,
      xp: userXP,
      racha: userRacha,
      isMe: true,
      isBot: false,
      initials: getInitials(userName),
      avatarColor: '#00D47A',
      ligaNivel: userLigaNivel,
    })

    // Fill 29 bots
    for (let i = 0; i < 29; i++) {
      const rand1 = seededRand(i * 7 + 1)
      const rand2 = seededRand(i * 7 + 2)
      const rand3 = seededRand(i * 7 + 3)
      const botXP = Math.floor(rand1 * 1800 + 100)
      const botRacha = Math.floor(rand2 * 20)
      const botName = BOT_NAMES[i] ?? `Trader ${i + 1}`
      entries.push({
        pos: 0,
        name: botName,
        xp: botXP,
        racha: botRacha,
        isMe: false,
        isBot: true,
        initials: getInitials(botName),
        avatarColor: AVATAR_COLORS[Math.floor(rand3 * AVATAR_COLORS.length)],
        ligaNivel: Math.floor(rand1 * 3) + 1,
      })
    }

    // Sort by XP
    entries.sort((a, b) => b.xp - a.xp)
    entries.forEach((e, i) => { e.pos = i + 1 })
    setRanking(entries)
  }

  const me = ranking.find(r => r.isMe)
  const ligaNombre = LIGA_NAMES[(me?.ligaNivel ?? 1) - 1] ?? 'Novato'

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Liga</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Liga {ligaNombre} · 30 participantes</div>
      </div>

      {/* My position card */}
      <div style={{
        background: 'rgba(0,212,122,.06)', border: '.5px solid rgba(0,212,122,.2)',
        borderRadius: 14, padding: 18, marginBottom: 20,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginBottom: 6, letterSpacing: '.08em', textTransform: 'uppercase' }}>Mi posición</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 800 }}>
            #{me?.pos ?? '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>XP esta semana</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>
            {me?.xp ?? 0}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Reinicio en</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700 }}>
            {daysUntilReset} {daysUntilReset === 1 ? 'día' : 'días'}
          </div>
        </div>
      </div>

      {/* Zone legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', opacity: .7 }} />
          <span style={{ color: 'var(--muted)' }}>Top 7 ascienden de liga</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)', opacity: .7 }} />
          <span style={{ color: 'var(--muted)' }}>Zona segura</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', opacity: .7 }} />
          <span style={{ color: 'var(--muted)' }}>Últimos 5 descienden</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '.5px solid var(--border)' }}>
        {[{ key: 'week' as const, label: 'Esta semana' }, { key: 'history' as const, label: 'Histórico' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 20px', background: 'none', border: 'none',
            borderBottom: activeTab === t.key ? '2px solid var(--green)' : '2px solid transparent',
            color: activeTab === t.key ? 'var(--white)' : 'var(--muted)',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500,
            cursor: 'pointer', marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Histórico próximamente</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>El histórico de ligas anteriores estará disponible cuando finalice la primera semana completa.</div>
        </div>
      )}

      {/* Ranking table */}
      {activeTab === 'week' && (
        <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Cargando ranking...</div>
          ) : (
            ranking.map((entry, i) => {
              const ascending = entry.pos <= 7
              const descending = entry.pos > 25
              const medal = entry.pos <= 3 ? ['🥇', '🥈', '🥉'][entry.pos - 1] : null

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                    borderBottom: i < ranking.length - 1 ? '.5px solid var(--border)' : 'none',
                    background: entry.isMe
                      ? 'rgba(0,212,122,.06)'
                      : ascending && entry.pos <= 3 ? 'rgba(255,215,0,.025)' : 'transparent',
                    borderLeft: ascending
                      ? '2px solid rgba(0,212,122,.4)'
                      : descending ? '2px solid rgba(239,83,80,.4)'
                      : '2px solid rgba(249,168,37,.2)',
                    outline: entry.isMe ? '1px solid rgba(0,212,122,.2)' : 'none',
                  }}
                >
                  {/* Position */}
                  <div style={{
                    width: 30, textAlign: 'center', fontFamily: 'var(--serif)',
                    fontSize: medal ? 18 : 14, fontWeight: 800,
                    color: entry.pos === 1 ? 'var(--gold)'
                      : entry.pos === 2 ? '#C0C0C0'
                      : entry.pos === 3 ? '#CD7F32'
                      : ascending ? 'var(--green)'
                      : descending ? 'var(--red)'
                      : 'var(--muted)',
                    flexShrink: 0,
                  }}>
                    {medal ?? entry.pos}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: entry.avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 800, color: '#07090A',
                    border: entry.isMe ? '2px solid #FFD700' : '2px solid transparent',
                  }}>
                    {entry.initials}
                  </div>

                  {/* Name & info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 13, fontWeight: entry.isMe ? 700 : 500,
                        color: entry.isMe ? 'var(--green)' : 'var(--white)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {entry.name}
                      </span>
                      {entry.isMe && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 100,
                          background: 'rgba(255,215,0,.15)', color: '#FFD700',
                          border: '.5px solid rgba(255,215,0,.3)', letterSpacing: '.05em',
                        }}>
                          TÚ
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {entry.racha > 0 && `🔥 ${entry.racha} días · `}
                      Liga {LIGA_NAMES[(entry.ligaNivel ?? 1) - 1] ?? 'Novato'}
                    </div>
                  </div>

                  {/* XP */}
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 700,
                    color: entry.isMe ? 'var(--green)' : ascending ? 'var(--white)' : 'var(--muted)',
                    textAlign: 'right', flexShrink: 0,
                  }}>
                    {entry.xp} XP
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
