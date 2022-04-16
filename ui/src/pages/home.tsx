/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react'
import { Automation } from '../api'
import { ActionBar, AutomationExecution, AutomationSelect } from '../features/automation'
import { DragDropNodes, Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'
import { Layout } from '../features/ui'

const borderRight = (theme: Theme) => ({ borderRight: '1px solid', borderColor: theme.color.text })
const center = css({ display: 'flex', alignItems: 'center', padding: '10px 20px' })

export default function Home() {
	const { executionId, selected, setExecutionId, setSelected } = useTaskStatus()

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
					<AutomationSelect
						value={selected}
						onChange={(value) => {
							setSelected(value)
							setExecutionId(undefined)
						}}
					/>
					<AutomationExecution
						automationName={selected?.name}
						value={executionId}
						onChange={setExecutionId}
					/>
				</div>

				<ActionBar deselectAutomation={() => setSelected(undefined)} />
			</div>
			<div css={center}>
				<DragDropNodes />
			</div>
		</div>
	)
}
