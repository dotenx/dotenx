import { Prism } from '@mantine/prism'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomationYaml, QueryKey } from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { Loader } from '../ui'

export function AutomationYaml({ name }: { name: string }) {
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const query = useQuery([QueryKey.GetAutomationYaml, name], () =>
		getAutomationYaml({ name, projectName })
	)
	const code = query.data?.data ?? ''
	if (query.isLoading) return <Loader />
	return <Prism language="yaml">{code}</Prism>
}
