import { ReactNode } from 'react'

export function OptionsWrapper({ children }: { children: ReactNode }) {
	return <div className="space-y-4">{children}</div>
}
