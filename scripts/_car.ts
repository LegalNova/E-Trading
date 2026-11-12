import { QUIZZES } from '../src/server/content/dsl'
import { UNITS } from '../src/server/content/catalog'
for (const u of UNITS) for (const l of u.lessons) { if (l.isUnitReview || l.isBoss) continue
  for (const q of QUIZZES[l.quizId] ?? []) if (['SCENARIO', 'CHAT'].includes(q.type) && typeof q.solution === 'number') q.options.forEach((o, i) => { if (i !== q.solution && /préstamo/i.test(o)) console.log(q.id, i, '|', o, '|', q.prompt.slice(0, 110)) }) }
