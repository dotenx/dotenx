/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAutomation, QueryKey, startAutomation } from '../../api'
import { listenAtom, selectedExecutionAtom, selectedPipelineDataAtom } from '../../pages/home'
import { flowAtom, initialElements } from '../flow'
import { useClearStatus } from '../flow/use-clear-status'
import { useLayout } from '../flow/use-layout'
import { Modals, useModal } from '../hooks/use-modal'
import { Button, Modal } from '../ui'
import { SaveForm } from './save-form'
import { selectedPipelineAtom } from './selection'

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
	const [selectedPipelineData] = useAtom(selectedPipelineDataAtom)
	const deletePipelineMutation = useMutation(deleteAutomation)

	const mutation = useMutation((endpoint: string) => startAutomation(endpoint), {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
			setSelectedExec(undefined)
			setListen((x) => x + 1)
		},
	})

	const onRun = () => {
		if (selectedPipeline) mutation.mutate(selectedPipeline.endpoint)
	}

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
				<Button
					css={redSmallButton}
					disabled={!selectedPipeline}
					onClick={() => {
						if (!selectedPipelineData) return
						deletePipelineMutation.mutate(selectedPipelineData.name, {
							onSuccess: () => {
								resetPipeline()
								client.invalidateQueries(QueryKey.GetAutomations)
							},
						})
					}}
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

	function resetPipeline() {
		setSelectedPipeline(undefined)
		setElements(initialElements)
		deselectPipeline()
	}
}
