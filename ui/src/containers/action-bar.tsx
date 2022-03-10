import { css, Theme } from '@emotion/react'
import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { QueryKey, startPipeline } from '../api'
import { Button } from '../components/button'
import { Modal } from '../components/modal'
import { useClearStatus } from '../hooks/use-clear-status'
import { flowAtom, initialElements } from '../hooks/use-flow'
import { useLayout } from '../hooks/use-layout'
import { Modals, useModal } from '../hooks/use-modal'
import { listenAtom, selectedExecutionAtom } from '../pages'
import { selectedPipelineAtom } from './pipeline-select'
import { SaveForm } from './save-form'

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
	const { onLayout } = useLayout()
	const modal = useModal()
	const [selectedPipeline, setSelectedPipeline] = useAtom(selectedPipelineAtom)
	const clearStatus = useClearStatus()
	const client = useQueryClient()
	const setSelectedExec = useAtom(selectedExecutionAtom)[1]
	const setListen = useAtom(listenAtom)[1]
	const setElements = useAtom(flowAtom)[1]

	const mutation = useMutation(startPipeline, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
			setSelectedExec(undefined)
			setListen((x) => x + 1)
		},
	})

	const onRun = () => {
		if (selectedPipeline) mutation.mutate({ endpoint: selectedPipeline.endpoint })
	}

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
				<Button
					css={redSmallButton}
					disabled={!selectedPipeline}
					onClick={() => {
						setSelectedPipeline(undefined)
						setElements(initialElements)
						deselectPipeline()
					}}
				>
					Delete
				</Button>
				<Button
					css={smallButton}
					onClick={() => {
						setSelectedPipeline(undefined)
						setElements(initialElements)
						deselectPipeline()
					}}
				>
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
