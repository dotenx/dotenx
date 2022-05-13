import clsx from 'clsx'
import { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'
import ReactModal from 'react-modal'
import { Modals, useModal } from '../hooks'
import { Fade } from './animation/fade'

type RenderChildren = (data: unknown) => ReactNode
type Size = 'md' | 'lg'

interface ModalProps {
	children: ReactNode | RenderChildren
	kind: Modals
	title?: string
	size?: Size
}

export function Modal({ children, kind, title, size = 'md' }: ModalProps) {
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
				<Content title={title} size={size}>
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
}

function Content({ title, children, size }: ContentProps) {
	const modal = useModal()

	return (
		<div className="fixed inset-0 bg-slate-50/75" onClick={modal.close}>
			<div
				className={clsx(
					'mx-auto overflow-hidden bg-white rounded-lg shadow-2xl text-slate-700 outline-none',
					size === 'md' && 'max-w-md mt-[10vh]',
					size === 'lg' && 'max-w-7xl mt-[5vh]'
				)}
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
				<div
					className={clsx(
						'p-5 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300',
						size === 'md' && 'h-[75vh]',
						size === 'lg' && 'h-[85vh]'
					)}
				>
					{typeof children === 'function' ? children(modal.data ?? {}) : children}
				</div>
			</div>
		</div>
	)
}
