import { ActionIcon, Button, Divider, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import Editor from '@monaco-editor/react'
import { useState } from 'react'
import { TbPlus, TbTrash } from 'react-icons/tb'
import { z } from 'zod'
import { Extension, InputKind } from './api'

const schema = z.object({
	name: z.string().min(1).max(100),
	inputs: z.array(
		z.object({
			name: z.string().min(1).max(100),
			kind: z.nativeEnum(InputKind),
		})
	),
	outputs: z.array(
		z.object({
			name: z.string().min(1).max(100),
		})
	),
})

type Schema = z.infer<typeof schema>

const defaultInit = `function init({ data, root, fetchDataSource }) {
	
}
`

export function ExtensionForm({
	mode,
	onSubmit,
	submitting,
	initialValues = {
		name: '',
		category: 'Misc',
		content: {
			inputs: [],
			outputs: [],
			html: '',
			init: defaultInit,
			action: '{\n\t\n}',
			head: '',
		},
	},
}: {
	mode: 'create' | 'edit'
	onSubmit: (values: Extension) => void
	submitting: boolean
	initialValues?: Extension
}) {
	const form = useForm<Schema>({
		initialValues: {
			name: initialValues.name,
			inputs: initialValues.content.inputs,
			outputs: initialValues.content.outputs,
		},
	})
	const [html, setHtml] = useState(initialValues.content.html)
	const [init, setInit] = useState(initialValues.content.init)
	const [action, setAction] = useState(initialValues.content.action)
	const [head, setHead] = useState(initialValues.content.head)
	const handleSubmit = form.onSubmit((values) =>
		onSubmit({
			name: values.name,
			content: { inputs: values.inputs, outputs: values.outputs, html, init, action, head },
			category: 'Misc',
		})
	)

	return (
		<form onSubmit={handleSubmit} className="pb-10 space-y-6">
			<TextInput
				mt="xl"
				label="Extension name"
				placeholder="Choose a name for the extension"
				{...form.getInputProps('name')}
				style={{ width: 300 }}
				disabled={mode === 'edit'}
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
				onClick={() => form.insertListItem('inputs', { name: '', kind: InputKind.Text })}
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
				defaultValue={initialValues.content.html}
				title="HTML"
				language="html"
				onChange={setHtml}
			/>
			<CodeEditor
				defaultValue={initialValues.content.init}
				title="Init"
				language="javascript"
				onChange={setInit}
			/>
			<CodeEditor
				defaultValue={initialValues.content.action}
				title="Action"
				language="javascript"
				onChange={setAction}
			/>
			<CodeEditor
				defaultValue={initialValues.content.head}
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
			<div className="overflow-hidden rounded">
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
