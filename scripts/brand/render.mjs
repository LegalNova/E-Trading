// Genera los PNG del icono de la app a partir de los SVG de marca (Identidad 3a · Bancal)
import sharp from 'sharp'
const dir = new URL('.', import.meta.url).pathname
const out = [
  ['app-icon.svg', 'src/app/apple-icon.png', 180],
  ['app-icon.svg', 'public/icons/icon-192.png', 192],
  ['app-icon.svg', 'public/icons/icon-512.png', 512],
  ['app-icon-maskable.svg', 'public/icons/maskable-512.png', 512],
]
for (const [src, dst, size] of out) {
  await sharp(dir + src, { density: 600 }).resize(size, size).png().toFile(dst)
  console.log(dst)
}
