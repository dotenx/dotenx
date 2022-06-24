import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { StreamLanguage } from '@codemirror/stream-parser'
import CodeMirror from '@uiw/react-codemirror'
import { useState } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createAutomationYaml } from '../api'
import { Button } from '../features/ui'

export default function ImportYamlPage() {
	const navigate = useNavigate()
	const { mutate, isLoading } = useMutation(createAutomationYaml, {
		onSuccess: ({ data }) => navigate(`/automations/${data.name}`),
	})
	const [code, setCode] = useState('')

	return (
		<div className="grow">
			<div className="flex flex-col h-full gap-10 px-32 py-16">
				<h3 className="text-2xl font-bold">Import YAML</h3>
				<form
					className="flex flex-col gap-6 grow"
					onSubmit={(e) => {
						e.preventDefault()
						mutate(code)
					}}
				>
					<CodeMirror
						minHeight="60vh	"
						height="100%"
						extensions={[StreamLanguage.define(yaml)]}
						onChange={(value) => setCode(value)}
					/>
					<Button loading={isLoading} type="submit" className="self-end w-48">
						Import and Save
					</Button>
				</form>
			</div>
		</div>
	)
}
