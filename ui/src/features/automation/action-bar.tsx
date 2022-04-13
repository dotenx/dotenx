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
	deselectPipeline: () => void
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

export function ActionBar({ deselectPipeline }: ActionBarProps) {
	const { onDelete, onRun, selectedPipeline, modal, onLayout, resetPipeline } =
		useActionBar(deselectPipeline)

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
				<IconButton tooltip="Delete" disabled={!selectedPipeline} onClick={onDelete}>
					<BsTrash2 />
				</IconButton>
				<IconButton tooltip="New" onClick={resetPipeline}>
					<BsPlus />
				</IconButton>
				<IconButton tooltip="Sort" onClick={() => onLayout('TB')}>
					<BsSortDownAlt />
				</IconButton>
				<IconButton tooltip="Save" onClick={() => modal.open(Modals.SavePipeline)}>
					<BsSave2 />
				</IconButton>
				<IconButton tooltip="Run" onClick={onRun} disabled={!selectedPipeline}>
					<BsPlay />
				</IconButton>
			</div>
			<Modal kind={Modals.SavePipeline}>
				<SaveForm />
			</Modal>
		</>
	)
}
