import { ReactNode } from 'react'

export function Description({ children }: { children: ReactNode }) {
	return <p className="text-xs mt-1.5">{children}</p>
}
