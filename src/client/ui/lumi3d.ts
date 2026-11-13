'use client'
// Lumi en 3D (ronda 11, bloque E, aprobado por Joan el 13-11-2026): el mismo cubo de gelatina, con volumen, brillo y rebote.
// Un solo motor WebGL para todas las Lumis de la pantalla: dibuja cada una por turnos y copia la imagen a su lienzo.
// Así no se gasta un contexto WebGL por Lumi (el navegador solo permite unos pocos). Se carga aparte, solo cuando hace falta;
// mientras tanto (o si el móvil no tiene WebGL) se ve la Lumi plana de siempre.
import {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, SRGBColorSpace, Vector3, WebGLRenderer, type BufferAttribute,
} from 'three'
import type { Mood } from '@/shared/contract'

export interface LumiParams {
  mood: Mood
  /** Color del cuerpo (hex, o «var(--lumi)») */
  color: string
  /** Burbujitas de luz (1 a 5) */
  stage: number
  animated: boolean
}
export interface LumiHandle {
  update(p: LumiParams): void
  dispose(): void
}

/** Lado del dibujo interno (se reduce al tamaño de cada Lumi al copiarlo) */
const RES = 256

// ── La cara: los mismos trazos que la Lumi plana (viewBox 48×48) ──
const EYES: Record<Mood, { s?: string; f?: string; dots?: [number, number, number][] }> = {
  HAPPY: { s: 'M15 21q3-4 6 0M27 21q3-4 6 0' },
  CELEBRATE: { f: 'M18 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4zM30 16l1.4 3 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4z' },
  WORRIED: { s: 'M14 15l6 3M34 15l-6 3', dots: [[18, 22, 3], [30, 22, 3]] },
  CALM: { s: 'M15 21h6M27 21h6' },
  SAD: { s: 'M14 16l5-2M34 16l-5-2', dots: [[18, 21, 3], [30, 21, 3]] },
  SLEEPY: { s: 'M15 21q3 3 6 0M27 21q3 3 6 0' },
  THINKING: { dots: [[18, 21, 3], [31, 19, 3]] },
}
const MOUTH: Record<Mood, { s?: string; f?: string; dots?: [number, number, number][] }> = {
  HAPPY: { s: 'M19 30q5 5 10 0' },
  CELEBRATE: { f: 'M18 29q6 8 12 0z' },
  WORRIED: { s: 'M19 32q5-4 10 0' },
  CALM: { s: 'M20 31h8' },
  SAD: { s: 'M19 33q5-5 10 0' },
  SLEEPY: { dots: [[24, 31, 2.4]] },
  THINKING: { s: 'M20 31q4 2 8-1' },
}
const BUBBLES: [number, number, number][] = [[38, 37, 1.6], [9, 36, 1.3], [39, 11, 1.2], [10, 12, 1.1], [24, 41, 1.4]]

type Inst = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  p: LumiParams
  color: Color
  visible: boolean
  dirty: boolean
  seed: number
  moodT: number
  /** Última vez que se leyó el color del tema (cambia al pasar a modo oscuro) */
  resolvedAt: number
  io?: IntersectionObserver
}

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Color real del cuerpo: resuelve «var(--lumi)» con el tema actual */
function resolve(c: string) {
  if (c.startsWith('var(')) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(c.slice(4, -1)).trim()
    return v || '#0071e3'
  }
  return c
}

function createEngine() {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(1)
  renderer.setSize(RES, RES, false)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(20.5, 1, 0.1, 50)
  camera.position.set(0, 0.95, 7.2)
  camera.lookAt(0, 0.2, 0)
  scene.add(new HemisphereLight(0xffffff, 0x8a7f70, 2.3))
  const key = new DirectionalLight(0xffffff, 2.6)
  key.position.set(-3, 5, 4)
  scene.add(key)
  const rim = new DirectionalLight(0xffffff, 1.4)
  rim.position.set(3, 2, -3)
  scene.add(rim)

  // El cubo: caja con muchas divisiones y esquinas redondeadas
  const R = 0.42, H = 1, SEG = 16
  const geo = new BoxGeometry(2, 2, 2, SEG, SEG, SEG)
  const pos = geo.attributes.position as BufferAttribute
  const base = new Float32Array(pos.count * 3)
  const v = new Vector3(), inner = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    inner.set(Math.max(-(H - R), Math.min(H - R, v.x)), Math.max(-(H - R), Math.min(H - R, v.y)), Math.max(-(H - R), Math.min(H - R, v.z)))
    v.sub(inner).normalize().multiplyScalar(R).add(inner)
    base[i * 3] = v.x
    base[i * 3 + 1] = v.y
    base[i * 3 + 2] = v.z
  }
  const mat = new MeshPhysicalMaterial({ color: '#0071e3', roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true, opacity: 0.92 })
  const body = new Mesh(geo, mat)
  const lumi = new Group()
  lumi.add(body)
  scene.add(lumi)

  // Burbujitas de luz dentro (se ven a través de la gelatina)
  const bubbleMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthTest: false })
  const bubbles = BUBBLES.map(([x, y, r], i) => {
    const m = new Mesh(new SphereGeometry((r / 24) * 1.25, 14, 10), bubbleMat)
    m.renderOrder = 2
    m.userData.base = new Vector3(((x - 24) / 24) * 0.8, (-(y - 24) / 24) * 0.8, 0.45 - i * 0.12)
    lumi.add(m)
    return m
  })

  // La cara: un plano pegado al frente que se deforma con el cubo
  const faceGeo = new PlaneGeometry(2, 2, 10, 10)
  const fpos = faceGeo.attributes.position as BufferAttribute
  const fbase = new Float32Array(fpos.count * 3)
  for (let i = 0; i < fpos.count; i++) {
    fbase[i * 3] = fpos.getX(i)
    fbase[i * 3 + 1] = fpos.getY(i)
    fbase[i * 3 + 2] = 1.004
  }
  const faceMat = new MeshBasicMaterial({ transparent: true, depthWrite: false })
  const face = new Mesh(faceGeo, faceMat)
  face.renderOrder = 3
  lumi.add(face)

  // Sombra en el suelo
  const sc = document.createElement('canvas')
  sc.width = sc.height = 128
  const sx = sc.getContext('2d')!
  const g = sx.createRadialGradient(64, 64, 4, 64, 64, 62)
  g.addColorStop(0, 'rgba(0,0,0,0.32)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  sx.fillStyle = g
  sx.fillRect(0, 0, 128, 128)
  const shadow = new Mesh(new PlaneGeometry(3.1, 3.1), new MeshBasicMaterial({ map: new CanvasTexture(sc), transparent: true, depthWrite: false }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -1.02
  scene.add(shadow)

  // Caras ya dibujadas (una por estado y por ojos abiertos o cerrados)
  const faces = new Map<string, CanvasTexture>()
  function faceTex(mood: Mood, closed: boolean) {
    const k = `${mood}:${closed ? 1 : 0}`
    let t = faces.get(k)
    if (t) return t
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const x = c.getContext('2d')!
    x.scale(256 / 48, 256 / 48)
    x.fillStyle = x.strokeStyle = '#fff'
    x.lineCap = 'round'
    x.lineJoin = 'round'
    x.lineWidth = 2.5
    const e = EYES[mood]
    x.save()
    x.translate(0, 20)
    x.scale(1, closed ? 0.15 : 1)
    x.translate(0, -20)
    if (e.s) x.stroke(new Path2D(e.s))
    if (e.f) x.fill(new Path2D(e.f))
    for (const [cx, cy, r] of e.dots ?? []) {
      x.beginPath()
      x.arc(cx, cy, r, 0, Math.PI * 2)
      x.fill()
    }
    x.restore()
    const m = MOUTH[mood]
    if (m.s) x.stroke(new Path2D(m.s))
    if (m.f) x.fill(new Path2D(m.f))
    for (const [cx, cy, r] of m.dots ?? []) {
      x.beginPath()
      x.arc(cx, cy, r, 0, Math.PI * 2)
      x.fill()
    }
    x.globalAlpha = 0.5
    x.lineWidth = 2.4
    x.stroke(new Path2D('M10 9q6-4 13-3'))
    t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    faces.set(k, t)
    return t
  }

  // Cómo se mueve en cada estado (mismo carácter que la Lumi plana: salta al celebrar, se encoge triste…)
  function params(mood: Mood, t: number, moodT: number, M: number) {
    const b = { squash: 0, wobble: 0.03, speed: 3, shiver: 0, hop: 0, spin: 0, tilt: 0 }
    switch (mood) {
      case 'HAPPY': {
        const c = (t % 2.2) / 2.2
        b.hop = c < 0.3 ? Math.sin((c / 0.3) * Math.PI) * 0.16 : 0
        b.squash = c < 0.06 ? -0.06 : c < 0.3 ? 0.04 : Math.sin(t * 2.2) * 0.02
        break
      }
      case 'CELEBRATE': {
        const c = (t % 1.1) / 1.1
        b.hop = Math.sin(c * Math.PI) * 0.32
        b.squash = c < 0.1 || c > 0.9 ? -0.1 : 0.07
        b.spin = moodT < 2.2 ? Math.min(1, moodT / 1.1) * Math.PI * 2 : 0
        b.wobble = 0.05
        break
      }
      case 'THINKING':
        b.tilt = -0.12
        b.squash = Math.sin(t * 1.4) * 0.015
        b.wobble = 0.015
        break
      case 'CALM':
        b.squash = Math.sin(t * 1.2) * 0.025
        b.wobble = 0.012
        b.speed = 1.2
        break
      case 'WORRIED':
        b.shiver = 0.01
        b.squash = -0.03 + Math.sin(t * 3) * 0.01
        b.wobble = 0.02
        break
      case 'SAD':
        b.squash = -0.1 + Math.sin(t * 0.9) * 0.015
        b.tilt = 0.06
        b.wobble = 0.01
        b.speed = 1
        break
      case 'SLEEPY':
        b.squash = -0.04 + Math.sin(t * 0.8) * 0.035
        b.tilt = 0.14
        b.wobble = 0.01
        b.speed = 0.8
        break
    }
    b.squash *= M
    b.wobble *= M
    b.hop *= M
    b.shiver *= M
    b.spin *= M < 1 ? 0 : 1
    return b
  }

  function deform(t: number, p: ReturnType<typeof params>, src: Float32Array, dst: BufferAttribute) {
    for (let i = 0; i < dst.count; i++) {
      let x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2]
      const hgt = (y + 1) / 2 // 0 abajo, 1 arriba: la base se queda pegada al suelo
      const s = p.squash
      y = -1 + (y + 1) * (1 + s)
      const k = 1 - s * 0.5
      x *= k
      z *= k
      const wob = p.wobble * hgt * hgt
      x += Math.sin(t * p.speed + src[i * 3 + 1] * 2.2) * wob
      z += Math.cos(t * p.speed * 0.9 + src[i * 3 + 1] * 2) * wob * 0.6
      if (p.shiver) x += Math.sin(t * 60) * p.shiver * hgt
      dst.setXYZ(i, x, y, z)
    }
    dst.needsUpdate = true
  }

  function draw(inst: Inst, now: number) {
    const M = inst.p.animated && !reduceMotion() ? 1 : 0
    const t = now + inst.seed
    const pr = params(inst.p.mood, t, inst.moodT, M)
    deform(t, pr, base, pos)
    geo.computeVertexNormals()
    deform(t, pr, fbase, fpos)
    lumi.position.set(pr.shiver ? Math.sin(t * 60) * pr.shiver : 0, pr.hop, 0)
    lumi.rotation.set(0, -0.32 + pr.spin, pr.tilt)
    mat.color.copy(inst.color)
    const st = Math.min(5, Math.max(1, inst.p.stage))
    bubbles.forEach((b, i) => {
      b.visible = i < st
      const u = b.userData.base as Vector3
      b.position.set(u.x, (u.y + 1) * (1 + pr.squash) - 1 + Math.sin(t * 1.3 + u.x * 4) * 0.03 * M, u.z)
    })
    // Parpadeo cada ~4 s (con sueño, ojos cerrados siempre)
    const blink = M > 0 && inst.p.mood !== 'SLEEPY' && inst.p.mood !== 'CELEBRATE' && (t % 4.2) / 4.2 > 0.965
    faceMat.map = faceTex(inst.p.mood, blink)
    faceMat.needsUpdate = true
    shadow.scale.setScalar(1 - pr.hop * 0.4)
    renderer.render(scene, camera)
    const c = inst.canvas
    inst.ctx.clearRect(0, 0, c.width, c.height)
    inst.ctx.drawImage(renderer.domElement, 0, 0, c.width, c.height)
  }

  const insts = new Set<Inst>()
  let raf = 0
  let last = performance.now() / 1000
  function loop() {
    raf = 0
    if (!insts.size) return
    raf = requestAnimationFrame(loop)
    if (document.hidden) return
    const now = performance.now() / 1000
    const dt = Math.min(0.05, now - last)
    last = now
    for (const i of insts) {
      if (!i.visible) continue
      i.moodT += dt
      if (i.p.color.startsWith('var(') && now - i.resolvedAt > 1) {
        i.resolvedAt = now
        const prev = i.color.getHex()
        i.color.set(resolve(i.p.color))
        if (i.color.getHex() !== prev) i.dirty = true
      }
      // Quieta (sin animación o con «reducir movimiento»): solo se dibuja cuando cambia algo
      const still = !i.p.animated || reduceMotion()
      if (still && !i.dirty) continue
      draw(i, still ? 0 : now)
      i.dirty = false
    }
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop)
  }

  let lost = false
  renderer.domElement.addEventListener('webglcontextlost', () => (lost = true))

  return {
    get lost() {
      return lost
    },
    attach(canvas: HTMLCanvasElement, p: LumiParams): LumiHandle | null {
      const ctx = canvas.getContext('2d')
      if (!ctx || lost) return null
      const inst: Inst = { canvas, ctx, p, color: new Color(resolve(p.color)), visible: true, dirty: true, seed: Math.random() * 10, moodT: 0, resolvedAt: performance.now() / 1000 }
      if (typeof IntersectionObserver !== 'undefined') {
        inst.io = new IntersectionObserver(es => {
          inst.visible = es.some(e => e.isIntersecting)
          if (inst.visible) {
            inst.dirty = true
            kick()
          }
        })
        inst.io.observe(canvas)
      }
      insts.add(inst)
      kick()
      return {
        update(np) {
          if (np.mood !== inst.p.mood) inst.moodT = 0
          inst.p = np
          inst.color.set(resolve(np.color))
          inst.dirty = true
          kick()
        },
        dispose() {
          inst.io?.disconnect()
          insts.delete(inst)
        },
      }
    },
  }
}

let engine: ReturnType<typeof createEngine> | null | undefined
/** Engancha una Lumi 3D a un lienzo. Devuelve null si el dispositivo no puede (se queda la Lumi plana) */
export function attachLumi(canvas: HTMLCanvasElement, p: LumiParams): LumiHandle | null {
  if (engine === undefined) {
    try {
      engine = createEngine()
    } catch {
      engine = null
    }
  }
  if (!engine || engine.lost) return null
  return engine.attach(canvas, p)
}
