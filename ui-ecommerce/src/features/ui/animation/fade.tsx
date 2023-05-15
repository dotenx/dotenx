import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"

interface FadeProps {
	isOpen: boolean
	children: ReactNode
}

export function Fade({ isOpen, children }: FadeProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.1 }}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	)
}
