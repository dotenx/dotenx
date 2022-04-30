import { useQuery } from 'react-query'
import { getAutomationYaml, QueryKey } from '../../api'

export function AutomationYaml({ name }: { name: string }) {
	const query = useQuery([QueryKey.GetAutomationYaml, name], () => getAutomationYaml(name))
	const yaml = query.data?.data

	return <div className="px-2 py-1 font-mono whitespace-pre rounded bg-gray-50">{yaml}</div>
}
