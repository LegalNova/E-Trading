// Imagen para compartir un logro, una racha o una clase (PNG).
// ?f=story → 1080×1350 (para enviar como imagen); por defecto 1200×630 (vista previa de los enlaces)
import { ImageResponse } from 'next/og'
import { resolveShare } from '@/server/share'
import { clientIp, rateLimit } from '@/server/http/ratelimit'

/** Manrope (la letra de Lumi) en negrita: se descarga una vez y se guarda en memoria */
let font: Promise<ArrayBuffer | null> | null = null
function manrope() {
  font ??= (async () => {
    try {
      // Con un navegador antiguo, Google Fonts sirve TTF (el generador de imágenes no lee WOFF2)
      const css = await (await fetch('https://fonts.googleapis.com/css2?family=Manrope:wght@800', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30' } })).text()
      // El bloque «latin» (acentos, ñ, ç y l·l incluidos); los demás alfabetos no hacen falta
      const url = css.split('/* latin */')[1]?.match(/src: url\((https:[^)]+)\)/)?.[1]
      return url ? await (await fetch(url)).arrayBuffer() : null
    } catch {
      return null
    }
  })()
  return font
}

const STAR = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z'

export async function GET(req: Request) {
  // Generar imágenes cuesta CPU: límite por red (las vistas previas de WhatsApp y compañía van por la caché)
  try {
    await rateLimit(`img:${clientIp(req)}`, 60, 60)
  } catch {
    return new Response('Demasiadas peticiones', { status: 429, headers: { 'Retry-After': '60' } })
  }
  const q = new URL(req.url).searchParams
  const card = await resolveShare(q)
  if (!card) return new Response('No encontrado', { status: 404 })
  const story = q.get('f') === 'story'
  const W = story ? 1080 : 1200
  const H = story ? 1350 : 630
  const s = story ? 1 : 0.62
  const bold = await manrope()
  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80 * s, background: 'linear-gradient(155deg, #172340 55%, #1e3a7a)', color: '#f7f3ec', fontFamily: bold ? 'Manrope' : 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 * s }}>
          {/* Lumi: el cubo azul */}
          <div style={{ width: 92 * s, height: 92 * s, borderRadius: 30 * s, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 * s }}>
            <div style={{ width: 13 * s, height: 13 * s, borderRadius: 99, background: '#fff' }} />
            <div style={{ width: 13 * s, height: 13 * s, borderRadius: 99, background: '#fff' }} />
          </div>
          <div style={{ display: 'flex', fontSize: 52 * s, fontWeight: 800, letterSpacing: -1.5 * s }}>
            Lumi<span style={{ color: '#2997ff' }}>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 * s }}>
          {card.kicker ? <div style={{ display: 'flex', fontSize: 40 * s, color: '#9db4e8', fontWeight: 700 }}>{card.kicker}</div> : null}
          {card.stars !== undefined ? (
            <div style={{ display: 'flex', gap: 14 * s }}>
              {Array.from({ length: card.slots ?? 3 }, (_, i) => (
                <svg key={i} width={130 * s} height={130 * s} viewBox="0 0 24 24">
                  <path d={STAR} fill={i < card.stars! ? '#ffd60a' : 'rgba(255,255,255,0.18)'} />
                </svg>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: (card.big.length > 3 ? 220 : 300) * s, fontWeight: 800, lineHeight: 1, color: '#ffffff', letterSpacing: -6 * s }}>{card.big}</div>
          )}
          <div style={{ display: 'flex', fontSize: (card.title.length > 60 ? 54 : 68) * s, fontWeight: 800, lineHeight: 1.12, maxWidth: W - 160 * s, letterSpacing: -1 * s }}>{card.title}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * s }}>
          <div style={{ display: 'flex', fontSize: 40 * s, fontWeight: 700 }}>{card.who}</div>
          <div style={{ display: 'flex', fontSize: 30 * s, color: '#b8c2d9', maxWidth: W - 160 * s }}>{card.cta}</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: bold ? [{ name: 'Manrope', data: bold, weight: 800, style: 'normal' }] : undefined, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
  )
}
