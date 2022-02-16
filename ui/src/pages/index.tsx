import { css, Theme } from '@emotion/react'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { Node } from 'react-flow-renderer'
import { API_URL, Pipeline, PipelineEventMessage } from '../api'
import { Layout } from '../components/layout'
import { NodeData } from '../components/pipe-node'
import { ActionBar } from '../containers/action-bar'
import { Flow } from '../containers/flow'
import { PipelineExecution } from '../containers/pipeline-execution'
import { PipelineSelect } from '../containers/pipeline-select'
import { Sidebar } from '../containers/sidebar'
import { flowAtom } from '../hooks/use-flow'

const borderRight = (theme: Theme) => ({ borderRight: '1px solid', borderColor: theme.color.text })
const center = css({ display: 'flex', alignItems: 'center', padding: '10px 20px' })

function Home() {
	const [selected, setSelected] = useState<Pipeline>()
	const [executionId, setExecutionId] = useState<number>()
	const setElements = useAtom(flowAtom)[1]

	const handleReceiveMessage = useCallback(
		(event: MessageEvent<string>) => {
			const data: PipelineEventMessage = JSON.parse(event.data)

			setElements((elements) =>
				elements.map((element) => {
					const updated = data.tasks.find((task) => task.name === element.id)
					if (!updated) return element
					const node = element as Node<NodeData>
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
		if (!selected) return
		const eventSource = new EventSource(`${API_URL}/execution/name/${selected.name}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [handleReceiveMessage, selected])

	useEffect(() => {
		if (!executionId) return
		const eventSource = new EventSource(`${API_URL}/execution/id/${executionId}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [executionId, handleReceiveMessage])

	return (
		<Layout>
			<div
				css={(theme) => ({
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					color: theme.color.text,
				})}
			>
				<div
					css={(theme) => ({
						borderBottom: '1px solid',
						borderColor: theme.color.text,
						display: 'flex',
					})}
				>
					<h1 css={[borderRight, center, { fontWeight: 100 }]}>Automated Ops</h1>
					<div
						css={[
							{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								flexGrow: 1,
							},
							borderRight,
							center,
						]}
					>
						<div css={{ display: 'flex', gap: 6 }}>
							<PipelineSelect value={selected} onChange={setSelected} />
							<PipelineExecution
								pipelineName={selected?.name}
								onChange={setExecutionId}
							/>
						</div>

						<ActionBar />
					</div>
					<div css={center}>
						<Sidebar />
					</div>
				</div>

				<div css={{ display: 'flex', flexGrow: '1', gap: 6 }}>
					<div css={{ flexGrow: '1' }}>
						<Flow />
					</div>
				</div>
			</div>
		</Layout>
	)
}

export default Home
