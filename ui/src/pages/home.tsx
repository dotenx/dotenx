/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Node } from 'react-flow-renderer'
import { useLocation } from 'react-router-dom'
import { API_URL, Automation, AutomationEventMessage } from '../api'
import { TaskNodeData } from '../components/task-node'
import { ActionBar } from '../containers/action-bar'
import { DragDropNodes } from '../containers/drag-drop-nodes'
import { Flow } from '../containers/flow'
import { Layout } from '../containers/layout'
import { PipelineExecution } from '../containers/pipeline-execution'
import { PipelineSelect } from '../containers/pipeline-select'
import { useClearStatus } from '../hooks/use-clear-status'
import { flowAtom } from '../hooks/use-flow'

export const selectedExecutionAtom = atom<number | undefined>(undefined)
export const listenAtom = atom(0)
export const selectedPipelineDataAtom = atom<Automation | undefined>(undefined)

const borderRight = (theme: Theme) => ({ borderRight: '1px solid', borderColor: theme.color.text })
const center = css({ display: 'flex', alignItems: 'center', padding: '10px 20px' })

export default function Home() {
	const location = useLocation()
	const [selected, setSelected] = useAtom(selectedPipelineDataAtom)
	const [executionId, setExecutionId] = useAtom(selectedExecutionAtom)
	const setElements = useAtom(flowAtom)[1]
	const clearStatus = useClearStatus()
	const [listen] = useAtom(listenAtom)

	const handleReceiveMessage = useCallback(
		(event: MessageEvent<string>) => {
			const data: AutomationEventMessage = JSON.parse(event.data)

			setElements((elements) =>
				elements.map((element) => {
					const updated = data.tasks.find((task) => task.name === element.id)
					if (!updated) return element
					const node = element as Node<TaskNodeData>
					if (!node.data) return node
					return {
						...node,
						data: {
							...node.data,
							status: updated.status,
							name: updated.name,
							executionId: data.execution_id,
						},
					}
				})
			)
		},
		[setElements]
	)

	useEffect(() => {
		if (executionId) return
		if (!selected) return
		const eventSource = new EventSource(`${API_URL}/execution/name/${selected.name}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		eventSource.addEventListener('end', () => eventSource.close())
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [executionId, handleReceiveMessage, selected, listen])

	useEffect(() => {
		if (!executionId) return
		clearStatus()
		const eventSource = new EventSource(`${API_URL}/execution/id/${executionId}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		eventSource.addEventListener('end', () => eventSource.close())
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [clearStatus, executionId, handleReceiveMessage])

	return (
		<Layout
			pathname={location.pathname}
			header={
				<Header
					executionId={executionId}
					selected={selected}
					setExecutionId={setExecutionId}
					setSelected={setSelected}
				/>
			}
		>
			<div css={{ display: 'flex', flexGrow: '1', gap: 6 }}>
				<div css={{ flexGrow: '1' }}>
					<Flow />
				</div>
			</div>
		</Layout>
	)
}

interface HeaderProps {
	selected: Automation | undefined
	setSelected: (value: Automation | undefined) => void
	executionId: number | undefined
	setExecutionId: (value: number | undefined) => void
}

function Header({ executionId, selected, setExecutionId, setSelected }: HeaderProps) {
	return (
		<div css={{ display: 'flex' }}>
			<div
				css={[
					{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						flexGrow: '1',
					},
					borderRight,
					center,
				]}
			>
				<div css={{ display: 'flex', gap: 6 }}>
					<PipelineSelect
						value={selected}
						onChange={(value) => {
							setSelected(value)
							setExecutionId(undefined)
						}}
					/>
					<PipelineExecution
						pipelineName={selected?.name}
						value={executionId}
						onChange={setExecutionId}
					/>
				</div>

				<ActionBar deselectPipeline={() => setSelected(undefined)} />
			</div>
			<div css={center}>
				<DragDropNodes />
			</div>
		</div>
	)
}
