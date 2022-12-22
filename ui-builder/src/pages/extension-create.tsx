import { ActionIcon, Anchor, Button, Container, Divider, TextInput, Title } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import Editor from '@monaco-editor/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { createExtension } from '../features/extensions/api'

export function ExtensionCreatePage() {
	const navigate = useNavigate()
	const createMutation = useMutation(createExtension, {
		onSuccess: (data) => navigate(`/extensions/${data.data.id}`),
	})
	const [name, setName] = useInputState('')
	const [html, setHtml] = useState('')
	const [js, setJs] = useState('')
	const [head, setHead] = useState('')

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Create Extension</Title>
				<BackToExtensions />
			</div>
			<Divider />
			<div className="space-y-6 pb-10">
				<TextInput
					mt="xl"
					label="Name"
					placeholder="Choose a name for the extension"
					value={name}
					onChange={setName}
					style={{ width: 300 }}
				/>
				<CodeEditor title="HTML" language="html" onChange={setHtml} />
				<CodeEditor title="JavaScript" language="javascript" onChange={setJs} />
				<CodeEditor title="Head" language="html" onChange={setHead} />
				<Button
					px="xl"
					onClick={() => createMutation.mutate({ name, html, js, head })}
					loading={createMutation.isLoading}
				>
					Create
				</Button>
			</div>
		</Container>
	)
}

export function CodeEditor({
	title,
	language,
	onChange,
	defaultValue,
}: {
	title: string
	language: 'html' | 'javascript'
	onChange: (value: string) => void
	defaultValue?: string
}) {
	return (
		<div>
			<Title order={2}>{title}</Title>
			<div className="rounded overflow-hidden">
				<Editor
					defaultValue={defaultValue}
					defaultLanguage={language}
					height="300px"
					theme="vs-dark"
					onChange={(value) => onChange(value ?? '')}
				/>
			</div>
		</div>
	)
}

export function BackToExtensions() {
	return (
		<Anchor component={Link} to="/extensions">
			<ActionIcon>
				<TbArrowLeft />
			</ActionIcon>
		</Anchor>
	)
}
