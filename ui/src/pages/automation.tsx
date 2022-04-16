/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Automation, getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom } from '../features/atoms'
import { ActionBar, AutomationExecution } from '../features/automation'
import { DragDropNodes, Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'
import { Layout } from '../features/ui'

const borderRight = (theme: Theme) => ({ borderRight: '1px solid', borderColor: theme.color.text })
const center = css({ display: 'flex', alignItems: 'center', padding: '10px 20px' })

export default function AutomationPage() {
	const { name } = useParams()
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const automationQuery = useQuery(
		[QueryKey.GetAutomation, name],
		() => {
			if (!name) return
			return getAutomation(name)
		},
		{ enabled: !!name, onSuccess: (data) => setSelectedAutomation(data?.data) }
	)
	const { executionId, selected, setExecutionId, setSelected } = useTaskStatus()
	const automation = automationQuery.data?.data

	useEffect(() => {
		if (name && automation) setSelected({ name, endpoint: automation.endpoint })
	}, [automation, name, setSelected])

	return (
		<Layout
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
					{selected && (
						<AutomationExecution
							automationName={selected?.name}
							value={executionId}
							onChange={setExecutionId}
						/>
					)}
				</div>

				<ActionBar deselectAutomation={() => setSelected(undefined)} />
			</div>
			<div css={center}>
				<DragDropNodes />
			</div>
		</div>
	)
}
