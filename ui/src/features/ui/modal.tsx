/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react'
import ReactModal from 'react-modal'
import { Modals, useModal } from '../hooks'

type RenderChildren = (data: unknown) => ReactNode

interface ModalProps {
	children: ReactNode | RenderChildren
	kind: Modals
}

export function Modal({ children, kind }: ModalProps) {
	const modal = useModal()

	return (
		<ReactModal
			isOpen={modal.isOpen && kind === modal.kind}
			onRequestClose={modal.close}
			style={{
				content: {
					maxWidth: '500px',
					margin: 'auto',
				},
			}}
		>
			{typeof children === 'function' ? children(modal.data ?? {}) : children}
		</ReactModal>
	)
}
