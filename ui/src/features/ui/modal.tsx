import { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'
import ReactModal from 'react-modal'
import { Modals, useModal } from '../hooks'
import { Fade } from './animation/fade'

type RenderChildren = (data: unknown) => ReactNode

interface ModalProps {
	children: ReactNode | RenderChildren
	kind: Modals
	title?: string
}

export function Modal({ children, kind, title }: ModalProps) {
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
				<Content title={title}>{children}</Content>
			</Fade>
		</ReactModal>
	)
}

function Content({ title, children }: { title?: string; children: ReactNode | RenderChildren }) {
	const modal = useModal()

	return (
		<div className="fixed inset-0 bg-slate-50/75" onClick={modal.close}>
			<div
				className="max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-2xl mt-[10vh] text-slate-700 outline-none"
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
				<div className="p-5 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 h-[75vh] scrollbar-thumb-slate-300">
					{typeof children === 'function' ? children(modal.data ?? {}) : children}
				</div>
			</div>
		</div>
	)
}
