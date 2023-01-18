import { ReactNode } from "react"

export function Heading({ children }: { children: ReactNode }) {
	return <h3 className="text-2xl font-bold">{children}</h3>
}
