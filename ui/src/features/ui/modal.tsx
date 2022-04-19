import { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'
import ReactModal from 'react-modal'
import { Modals, useModal } from '../hooks'

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
			className="max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-lg mt-[10vh] text-slate-700"
			style={{
				overlay: {
					zIndex: 10,
				},
			}}
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
		</ReactModal>
	)
}
