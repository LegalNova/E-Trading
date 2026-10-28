// Tipos de los textos traducibles del curso (src/server/content/v2/i18n/<idioma>/<unidad>.json)
export interface StepText { title?: string; body?: string; key?: string; tip?: string; prompt?: string; ok?: string; ko?: string }
export interface QuestionText {
  prompt: string; options: string[]; explanation: string
  right?: string[]; feedback?: string[]; lines?: string[]; senders?: string[]; unit?: string; horizon?: string; kinds?: string[]
}
export interface UnitText {
  unit: { title: string; description: string; section?: string }
  lessons: Record<string, { title: string; steps: StepText[] }>
  questions: Record<string, QuestionText>
}
export interface AchievementText { title: string; description: string }
