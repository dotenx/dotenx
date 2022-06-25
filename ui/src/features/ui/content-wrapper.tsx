import { ReactNode } from 'react'

export function ContentWrapper({ children }: { children: ReactNode }) {
	return <main className="px-32 py-16 space-y-10 grow">{children}</main>
}
