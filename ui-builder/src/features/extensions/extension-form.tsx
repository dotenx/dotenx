import { ActionIcon, Button, Divider, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { TbPlus, TbTrash } from 'react-icons/tb'
import { z } from 'zod'
import { RawExtension } from './api'

const schema = z.object({
	name: z.string().min(1).max(100),
	inputs: z.array(
		z.object({
			name: z.string().min(1).max(100),
		})
	),
	outputs: z.array(
		z.object({
			name: z.string().min(1).max(100),
		})
	),
})

type Schema = z.infer<typeof schema>

export function ExtensionForm({
	mode,
	onSubmit,
	submitting,
	initialValues = { name: '', body: { inputs: [], outputs: [], html: '', js: '', head: '' } },
}: {
	mode: 'create' | 'edit'
	onSubmit: (values: RawExtension) => void
	submitting: boolean
	initialValues?: RawExtension
}) {
	const form = useForm<Schema>({
		initialValues: {
			name: initialValues.name,
			inputs: initialValues.body.inputs,
			outputs: initialValues.body.outputs,
		},
	})
	const [html, setHtml] = useState(initialValues.body.html)
	const [js, setJs] = useState(initialValues.body.js)
	const [head, setHead] = useState(initialValues.body.head)
	const handleSubmit = form.onSubmit((values) =>
		onSubmit({
			name: values.name,
			body: { inputs: values.inputs, outputs: values.outputs, html, js, head },
		})
	)

	return (
		<form onSubmit={handleSubmit} className="space-y-6 pb-10">
			<TextInput
				mt="xl"
				label="Extension name"
				placeholder="Choose a name for the extension"
				{...form.getInputProps('name')}
				style={{ width: 300 }}
			/>
			<Divider label="Inputs" />
			<div className="space-y-2">
				{form.values.inputs.map((input, index) => (
					<div key={index} className="flex gap-4">
						<TextInput
							label="Name"
							placeholder="Choose a name for the input"
							{...form.getInputProps(`inputs.${index}.name`)}
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
			</div>
			<Button
				onClick={() => form.insertListItem('inputs', { name: '' })}
				leftIcon={<TbPlus />}
			>
				Input
			</Button>
			<Divider label="Outputs" />
			<div className="space-y-2">
				{form.values.outputs.map((output, index) => (
					<div key={index} className="flex gap-4">
						<TextInput
							label="Name"
							placeholder="Choose a name for the output"
							{...form.getInputProps(`outputs.${index}.name`)}
							style={{ width: 300 }}
						/>
						<ActionIcon
							className="self-end"
							onClick={() => form.removeListItem('outputs', index)}
						>
							<TbTrash />
						</ActionIcon>
					</div>
				))}
			</div>
			<Button
				onClick={() => form.insertListItem('outputs', { name: '' })}
				leftIcon={<TbPlus />}
			>
				Output
			</Button>
			<Divider label="Codes" />
			<CodeEditor
				defaultValue={initialValues.body.html}
				title="HTML"
				language="html"
				onChange={setHtml}
			/>
			<CodeEditor
				defaultValue={initialValues.body.js}
				title="JavaScript"
				language="javascript"
				onChange={setJs}
			/>
			<CodeEditor
				defaultValue={initialValues.body.head}
				title="Head"
				language="html"
				onChange={setHead}
			/>
			<Button px="xl" loading={submitting} type="submit">
				{mode === 'create' ? 'Create' : 'Save'}
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
