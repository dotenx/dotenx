/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { BsPlay, BsPlus, BsSave2, BsSortDownAlt, BsTrash2 } from 'react-icons/bs'
import { Modals } from '../hooks'
import { Modal } from '../ui'
import { IconButton } from '../ui/icon-button'
import { SaveForm } from './save-form'
import { useActionBar } from './use-action-bar'

const smallButton = css({ fontSize: 12, padding: '2px 0', width: 50 })

interface ActionBarProps {
	deselectAutomation: () => void
}

export const redSmallButton = [
	smallButton,
	(theme: Theme) => ({
		backgroundColor: theme.color.negative,
		borderColor: theme.color.negative,
		borderRadius: 4,
		':not([disabled]):hover': {
			color: `${theme.color.negative}`,
		},
	}),
]

export function ActionBar({ deselectAutomation }: ActionBarProps) {
	const { onDelete, onRun, selectedAutomation, modal, onLayout, newAutomation } =
		useActionBar(deselectAutomation)

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
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
