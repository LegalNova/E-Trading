const mockRanking = Array.from({ length: 30 }, (_, i) => ({
  pos: i + 1,
  name: i === 12 ? 'Tú' : `Trader ${i + 1}`,
  xp: Math.max(0, 1200 - i * 38 + Math.floor(Math.random() * 20)),
  racha: Math.floor(Math.random() * 21),
  isMe: i === 12,
})).sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, pos: i + 1 }))

export default function LigaPage() {
  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Liga</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Liga Novato · Semana 1 · 30 participantes</div>
      </div>

      {/* Tu posición */}
      <div style={{ background: 'var(--gfaint)', border: '.5px solid rgba(0,212,122,.2)', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>TU POSICIÓN</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 800 }}>
            #{mockRanking.find(u => u.isMe)?.pos || '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>XP esta semana</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>
            {mockRanking.find(u => u.isMe)?.xp || 0}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Reset en</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700 }}>6 días</div>
        </div>
      </div>

      {/* Zonas */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, fontSize: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', opacity: .7 }} />
          <span style={{ color: 'var(--muted)' }}>Top 7 ascienden</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', opacity: .7 }} />
          <span style={{ color: 'var(--muted)' }}>Últimos 5 descienden</span>
        </div>
      </div>

      {/* Ranking */}
      <div style={{ background: 'var(--bg1)', border: '.5px solid var(--border2)', borderRadius: 14, overflow: 'hidden' }}>
        {mockRanking.map((user, i) => {
          const ascending = user.pos <= 7
          const descending = user.pos > 25
          return (
            <div key={user.pos} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px',
              borderBottom: i < 29 ? '.5px solid var(--border)' : 'none',
              background: user.isMe ? 'var(--gfaint)' : ascending && user.pos <= 3 ? 'rgba(255,215,0,.03)' : 'transparent',
              borderLeft: ascending ? '2px solid rgba(0,212,122,.3)' : descending ? '2px solid rgba(239,83,80,.3)' : '2px solid transparent',
            }}>
              <div style={{
                width: 28, textAlign: 'center', fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 800,
                color: user.pos === 1 ? 'var(--gold)' : user.pos === 2 ? 'var(--silver)' : user.pos === 3 ? 'var(--bronze)' : 'var(--muted)',
              }}>
                {user.pos <= 3 ? ['🥇','🥈','🥉'][user.pos-1] : user.pos}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: user.isMe ? 700 : 500, color: user.isMe ? 'var(--green)' : 'var(--white)' }}>
                  {user.name} {user.isMe && '← Tú'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>🔥 {user.racha} días de racha</div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: user.isMe ? 'var(--green)' : 'var(--white)' }}>
                {user.xp} XP
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
