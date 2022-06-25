import { ReactNode } from 'react'

export function Description({ children }: { children: ReactNode }) {
	return <p className="mt-1 text-xs">{children}</p>
}
