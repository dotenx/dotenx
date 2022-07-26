import { Prism } from '@mantine/prism'
import { useQuery } from 'react-query'
import { getAutomationYaml, QueryKey } from '../../api'
import { Loader } from '../ui'

export function AutomationYaml({ name }: { name: string }) {
	const query = useQuery([QueryKey.GetAutomationYaml, name], () => getAutomationYaml(name))
	const code = query.data?.data ?? ''
	if (query.isLoading) return <Loader />
	return <Prism language="yaml">{code}</Prism>
}
