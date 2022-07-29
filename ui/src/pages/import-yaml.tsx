import { Button } from '@mantine/core'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { useState } from 'react'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createAutomationYaml } from '../api'

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
					<CodeEditor
						value={code}
						language="yaml"
						onChange={(event) => setCode(event.target.value)}
						style={{ fontFamily: 'monospace', flexGrow: 1, overflowY: 'auto' }}
						className="rounded-md"
					/>
					<Button loading={isLoading} type="submit">
						Import and Save
					</Button>
				</form>
			</div>
		</div>
	)
}
