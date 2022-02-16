import { css } from '@emotion/react'
import { useAtom } from 'jotai'
import { isNode, Node } from 'react-flow-renderer'
import { useMutation } from 'react-query'
import { startPipeline } from '../api'
import { Button } from '../components/button'
import { Modal } from '../components/modal'
import { NodeData } from '../components/pipe-node'
import { flowAtom } from '../hooks/use-flow'
import { useLayout } from '../hooks/use-layout'
import { Modals, useModal } from '../hooks/use-modal'
import { selectedPipelineAtom } from './pipeline-select'
import { SaveForm } from './save-form'

const smallButton = css({ fontSize: 12, padding: '2px 0', width: 50 })

export function ActionBar() {
	const { onLayout } = useLayout()
	const modal = useModal()
	const [selectedPipeline] = useAtom(selectedPipelineAtom)
	const setElements = useAtom(flowAtom)[1]

	const mutation = useMutation(startPipeline, {
		onSuccess: () => {
			setElements((elements) =>
				elements.map((element) => {
					if (isNode(element)) {
						const node = element as Node<NodeData>
						if (!node.data) return node
						return { ...node, data: { ...node.data, status: undefined } }
					}
					return element
				})
			)
		},
	})

	const onRun = () => {
		if (selectedPipeline) mutation.mutate({ endpoint: selectedPipeline.endpoint })
	}

	return (
		<>
			<div css={{ display: 'flex', gap: 6 }}>
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
