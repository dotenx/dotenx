/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { Modals } from '../hooks'
import { Button, Modal } from '../ui'
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
	const {
		deletePipelineMutation,
		mutation,
		onDelete,
		onRun,
		selectedPipeline,
		modal,
		onLayout,
		resetPipeline,
	} = useActionBar(deselectPipeline)

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
				<Button
					css={redSmallButton}
					disabled={!selectedPipeline}
					onClick={onDelete}
					isLoading={deletePipelineMutation.isLoading}
				>
					Delete
				</Button>
				<Button css={smallButton} onClick={resetPipeline}>
					New
				</Button>
				<Button css={smallButton} onClick={() => onLayout('TB')}>
					Sort
				</Button>
				<Button css={smallButton} onClick={() => modal.open(Modals.SavePipeline)}>
					Save
				</Button>
				<Button
					css={smallButton}
					onClick={onRun}
					isLoading={mutation.isLoading}
					disabled={!selectedPipeline}
				>
					Run
				</Button>
			</div>
			<Modal kind={Modals.SavePipeline}>
				<SaveForm />
			</Modal>
		</>
	)
}
