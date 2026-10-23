import { FocusShell } from '@/client/shell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <FocusShell>{children}</FocusShell>
}
