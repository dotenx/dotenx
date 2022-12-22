import {
	ActionIcon,
	Anchor,
	Button,
	Container,
	Divider,
	Loader,
	TextInput,
	Title,
} from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { editExtension, getExtension } from '../features/extensions/api'
import { CodeEditor } from './extension-create'

export function ExtensionEditPage() {
	const { id = '' } = useParams()

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Edit Extension</Title>
				<Anchor component={Link} to={`/extensions/${id}`}>
					<ActionIcon>
						<TbArrowLeft />
					</ActionIcon>
				</Anchor>
			</div>
			<Divider />
			<EditExtensionForm id={id} />
		</Container>
	)
}

function EditExtensionForm({ id }: { id: string }) {
	const navigate = useNavigate()
	const editMutation = useMutation(editExtension, {
		onSuccess: (data) => navigate(`/extensions/${data.data?.id}`),
	})
	const [name, setName] = useInputState('')
	const [html, setHtml] = useState('')
	const [js, setJs] = useState('')
	const [head, setHead] = useState('')
	const extensionQuery = useQuery([QueryKey.Extension, id], () => getExtension({ id }), {
		enabled: !!id,
		onSuccess: (data) => {
			setName(data.data?.name)
			setHtml(data.data?.html ?? '')
			setJs(data.data?.js ?? '')
			setHead(data.data?.head ?? '')
		},
	})
	const extension = extensionQuery.data?.data

	if (extensionQuery.isLoading || !extension) return <Loader mt="xl" size="xs" mx="auto" />

	return (
		<div className="space-y-6 pb-10">
			<TextInput
				mt="xl"
				label="Name"
				placeholder="Choose a name for the extension"
				value={name}
				onChange={setName}
				style={{ width: 300 }}
			/>
			<CodeEditor
				defaultValue={extension.html}
				title="HTML"
				language="html"
				onChange={setHtml}
			/>
			<CodeEditor
				defaultValue={extension.js}
				title="JavaScript"
				language="javascript"
				onChange={setJs}
			/>
			<CodeEditor
				defaultValue={extension.head}
				title="Head"
				language="html"
				onChange={setHead}
			/>
			<Button
				px="xl"
				onClick={() => editMutation.mutate({ name, html, js, id, head })}
				loading={editMutation.isLoading}
			>
				Save
			</Button>
		</div>
	)
}
