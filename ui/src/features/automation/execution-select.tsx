import { format } from 'date-fns'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { getAutomationExecutions, QueryKey } from '../../api'

interface AutomationExecutionProps {
	automationName: string | undefined
	value: number | undefined
	onChange: (executionId: number) => void
}

export function AutomationExecution({ automationName, value, onChange }: AutomationExecutionProps) {
	const query = useQuery(
		[QueryKey.GetExecutions, automationName],
		() => {
			if (automationName) return getAutomationExecutions(automationName)
		},
		{ enabled: !!automationName }
	)

	const options = query.data?.data.map((execution) => ({
		label: format(new Date(execution.StartedAt), 'yyyy/MM/dd HH:mm:ss'),
		value: execution.Id,
	}))

	return (
		<Select
			className="z-10 w-64"
			placeholder="Execution"
			name="execution"
			isLoading={query.isLoading}
			options={options}
			onChange={(option) => option && onChange(option.value)}
			value={options?.find((option) => option.value === value) ?? null}
		/>
	)
}
