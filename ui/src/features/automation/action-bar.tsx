import { BsPlay, BsPlus, BsSave2, BsSortDownAlt, BsTrash2 } from 'react-icons/bs'
import { Modals } from '../hooks'
import { Modal } from '../ui'
import { IconButton } from '../ui/icon-button'
import { SaveForm } from './save-form'
import { useActionBar } from './use-action-bar'

export function ActionBar() {
	const { onDelete, onRun, selectedAutomation, modal, onLayout, newAutomation } = useActionBar()

	return (
		<>
			<div className="flex gap-2">
				<IconButton tooltip="Delete" disabled={!selectedAutomation} onClick={onDelete}>
					<BsTrash2 />
				</IconButton>
				<IconButton tooltip="New" onClick={newAutomation}>
					<BsPlus />
				</IconButton>
				<IconButton tooltip="Sort" onClick={() => onLayout('TB')}>
					<BsSortDownAlt />
				</IconButton>
				<IconButton tooltip="Save" onClick={() => modal.open(Modals.SaveAutomation)}>
					<BsSave2 />
				</IconButton>
				<IconButton tooltip="Run" onClick={onRun} disabled={!selectedAutomation}>
					<BsPlay />
				</IconButton>
			</div>
			<Modal kind={Modals.SaveAutomation}>
				<SaveForm />
			</Modal>
		</>
	)
}
