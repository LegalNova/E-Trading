// Texto con formato mínimo para lecciones y respuestas de Lumi: párrafos, viñetas y **negrita**
/** Texto de las lecciones: párrafos (línea en blanco), viñetas («• » o «1. ») y **negrita** */
export function RichText({ text }: { text: string }) {
  const inline = (line: string) => line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') && part.endsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part))
  return (
    <div className="flex flex-col gap-2.5">
      {text.split(/\n\n+/).map((block, i) => {
        const lines = block.split('\n')
        const bullets = lines.every(l => /^(•|-|\d+\.)\s/.test(l))
        if (bullets)
          return (
            <ul key={i} className="m-0 flex list-none flex-col gap-1.5 p-0">
              {lines.map((l, j) => {
                const m = l.match(/^(•|-|\d+\.)\s(.*)$/)!
                return (
                  <li key={j} className="t-body flex gap-2 text-[17px] leading-[25px]">
                    <span className="flex-none font-bold" style={{ color: 'var(--brand)', minWidth: 14 }}>
                      {m[1] === '•' || m[1] === '-' ? '•' : m[1]}
                    </span>
                    <span>{inline(m[2])}</span>
                  </li>
                )
              })}
            </ul>
          )
        return (
          <p key={i} className="t-body m-0 text-[17px] leading-[26px]">
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
