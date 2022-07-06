import { Modal, ModalProps } from '@mantine/core'
import { Modals, useModal } from '../hooks'

interface DrawerProps extends Omit<ModalProps, 'opened' | 'onClose'> {
	kind: Modals
}

export function NewModal({ kind, children, ...rest }: DrawerProps) {
	const modal = useModal()

	return (
		<Modal
			{...rest}
			opened={modal.isOpen && modal.kind === kind}
			onClose={modal.close}
			classNames={{
				root: 'text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700',
			}}
		>
			{children}
		</Modal>
	)
}
