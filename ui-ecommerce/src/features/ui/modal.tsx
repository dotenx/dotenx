import clsx from "clsx"
import { motion } from "framer-motion"
import { ReactNode } from "react"
import { IoClose } from "react-icons/io5"
import ReactModal from "react-modal"
import { Modals, useModal } from "../hooks"
import { Fade } from "./animation/fade"

type RenderChildren = (data: unknown) => ReactNode
type Size = "md" | "lg" | "xl"

interface ModalProps {
	children: ReactNode | any
	kind: Modals
	title?: string
	size?: Size
	fluid?: boolean
}

export function Modal({ children, kind, title, size = "md", fluid = false }: ModalProps) {
	const modal = useModal()

	return (
		<ReactModal
			isOpen={modal.isOpen && kind === modal.kind}
			onRequestClose={modal.close}
			className="none"
			overlayClassName="z-10 fixed inset-0"
			closeTimeoutMS={100}
		>
			<Fade isOpen={modal.isOpen}>
				<Content title={title} size={size} fluid={fluid}>
					{children}
				</Content>
			</Fade>
		</ReactModal>
	)
}

interface ContentProps {
	title?: string
	children: ReactNode | RenderChildren
	size: Size
	fluid: boolean
}

function Content({ title, children, size, fluid }: ContentProps) {
	const modal = useModal()

	return (
		<div
			className="fixed inset-0 bg-slate-50/75 text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700"
			onClick={modal.close}
		>
			<motion.div
				className="mx-auto overflow-hidden bg-white rounded-lg shadow-2xl outline-none text-slate-700"
				initial={false}
				transition={{ type: "spring" }}
				animate={{
					maxWidth: size === "md" ? "30rem" : size === "lg" ? "60rem" : "80rem",
					marginTop: size === "md" ? "10vh" : size === "lg" ? "10vh" : "5vh",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-4 py-2 text-white bg-rose-600">
					<h3>{title}</h3>
					<button
						className="text-2xl transition rounded outline-rose-500 hover:bg-rose-500 focus:bg-rose-500"
						type="button"
						onClick={modal.close}
					>
						<IoClose />
					</button>
				</div>
				<motion.div
					className={clsx(
						"p-5 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300",
						fluid && "max-h-[75vh]"
					)}
					initial={false}
					animate={{ height: fluid ? "auto" : getModalHeight(size) }}
				>
					{typeof children === "function" ? children(modal.data ?? {}) : children}
				</motion.div>
			</motion.div>
		</div>
	)
}

const getModalHeight = (size: Size) => {
	switch (size) {
		case "md":
			return "75vh"
		case "lg":
			return "75vh"
		case "xl":
			return "85vh"
		default:
			return "auto"
	}
}
