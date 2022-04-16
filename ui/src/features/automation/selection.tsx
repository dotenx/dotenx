/** @jsxImportSource @emotion/react */
import { useAtom } from 'jotai'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { Automation, getAutomation, getAutomations, QueryKey } from '../../api'
import { selectedAutomationAtom } from '../atoms'

interface AutomationSelectProps {
	value: Automation | undefined
	onChange: (value: Automation) => void
}

export function AutomationSelect({
	value: selected,
	onChange: setSelected,
}: AutomationSelectProps) {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const automations = automationsQuery.data?.data
	const options =
		automations?.map((automation) => ({ label: automation.name, value: automation })) ?? []

	useQuery(
		[QueryKey.GetAutomation, selected],
		() => {
			if (!selected) return
			return getAutomation(selected.name)
		},
		{ enabled: !!selected, onSuccess: (data) => setSelectedAutomation(data?.data) }
	)

	return (
		<Select
			css={{ width: 256, zIndex: 10 }}
			placeholder="Automation"
			options={options}
			name="automation"
			isLoading={automationsQuery.isLoading}
			onChange={(option) => option && setSelected(option.value)}
			value={options?.find((option) => option.value.name === selected?.name) ?? null}
		/>
	)
}
