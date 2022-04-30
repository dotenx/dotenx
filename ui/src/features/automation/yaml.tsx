import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { StreamLanguage } from '@codemirror/stream-parser'
import CodeMirror from '@uiw/react-codemirror'
import { useQuery } from 'react-query'
import { getAutomationYaml, QueryKey } from '../../api'

export function AutomationYaml({ name }: { name: string }) {
	const query = useQuery([QueryKey.GetAutomationYaml, name], () => getAutomationYaml(name))
	const code = query.data?.data

	return (
		<CodeMirror
			value={code}
			minHeight="60vh	"
			height="100%"
			editable={false}
			extensions={[StreamLanguage.define(yaml)]}
		/>
	)
}
