import { RaceBy } from "@uiball/loaders"
import clsx from "clsx"

export function Loader({ className, size }: { className?: string; size?: number }) {
	return (
		<div className={clsx("flex items-center justify-center", className)}>
			<RaceBy size={size} lineWeight={6} speed={1.4} color="currentColor" />
		</div>
	)
}
