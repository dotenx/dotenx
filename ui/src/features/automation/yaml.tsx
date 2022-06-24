import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { StreamLanguage } from '@codemirror/stream-parser'
import CodeMirror from '@uiw/react-codemirror'
import { useQuery } from 'react-query'
import { getAutomationYaml, QueryKey } from '../../api'
import { Loader } from '../ui'

export function AutomationYaml({ name }: { name: string }) {
	const query = useQuery([QueryKey.GetAutomationYaml, name], () => getAutomationYaml(name))
	const code = query.data?.data

	if (query.isLoading) return <Loader />

	return (
		<CodeMirror
			value={code}
			minHeight="60vh"
			height="100%"
			editable={false}
			extensions={[StreamLanguage.define(yaml)]}
		/>
	)
}
