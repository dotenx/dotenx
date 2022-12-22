import {
	ActionIcon,
	Anchor,
	Button,
	Container,
	Divider,
	Select,
	TextInput,
	Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import Editor from '@monaco-editor/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { TbArrowLeft, TbPlus, TbTrash } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createExtension } from '../features/extensions/api'

enum InputKind {
	Text = 'Text',
	Image = 'Image',
	Color = 'Color',
}

const schema = z.object({
	name: z.string().min(1).max(100),
	inputs: z.array(
		z.object({
			kind: z.nativeEnum(InputKind),
			name: z.string().min(1).max(100),
		})
	),
})

type Schema = z.infer<typeof schema>

export function ExtensionCreatePage() {
	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Create Extension</Title>
				<BackToExtensions />
			</div>
			<Divider />
			<CreateForm />
		</Container>
	)
}

function CreateForm() {
	const navigate = useNavigate()
	const createMutation = useMutation(createExtension, {
		onSuccess: (data) => navigate(`/extensions/${data.data.id}`),
	})
	const form = useForm<Schema>({ initialValues: { name: '', inputs: [] } })
	const [html, setHtml] = useState('')
	const [js, setJs] = useState('')
	const [head, setHead] = useState('')
	const onSubmit = form.onSubmit((values) => createMutation.mutate({ html, js, head, ...values }))

	return (
		<form onSubmit={onSubmit} className="space-y-6 pb-10">
			<div className="space-y-4">
				<TextInput
					mt="xl"
					label="Extension name"
					placeholder="Choose a name for the extension"
					{...form.getInputProps('name')}
					style={{ width: 300 }}
				/>
				{form.values.inputs.map((input, index) => (
					<div key={index} className="flex gap-4">
						<TextInput
							label="Input name"
							placeholder="Choose a name for the input"
							{...form.getInputProps(`inputs.${index}.name`)}
							style={{ width: 300 }}
						/>
						<Select
							label="Input kind"
							placeholder="Choose a kind for the input"
							data={[InputKind.Text, InputKind.Image, InputKind.Color]}
							{...form.getInputProps(`inputs.${index}.kind`)}
							style={{ width: 300 }}
						/>
						<ActionIcon
							className="self-end"
							onClick={() => form.removeListItem('inputs', index)}
						>
							<TbTrash />
						</ActionIcon>
					</div>
				))}
				<Button
					onClick={() =>
						form.insertListItem('inputs', { kind: InputKind.Text, name: '' })
					}
					leftIcon={<TbPlus />}
				>
					Input
				</Button>
			</div>
			<CodeEditor title="HTML" language="html" onChange={setHtml} />
			<CodeEditor title="JavaScript" language="javascript" onChange={setJs} />
			<CodeEditor title="Head" language="html" onChange={setHead} />
			<Button px="xl" loading={createMutation.isLoading} type="submit">
				Create
			</Button>
		</form>
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
