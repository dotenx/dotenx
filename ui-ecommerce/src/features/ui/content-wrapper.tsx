import clsx from "clsx"
import { ReactNode } from "react"

interface ContentWrapperProps {
	children: ReactNode
	className?: string
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
	return <main className={clsx("space-y-10 grow", className)}>{children}</main>
}
