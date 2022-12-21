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
import { editPlugin, getPlugin } from '../features/plugins/api'
import { CodeEditor } from './plugin-create'

export function PluginEditPage() {
	const { id = '' } = useParams()

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Edit Plugin</Title>
				<Anchor component={Link} to={`/plugins/${id}`}>
					<ActionIcon>
						<TbArrowLeft />
					</ActionIcon>
				</Anchor>
			</div>
			<Divider />
			<EditPluginForm id={id} />
		</Container>
	)
}

function EditPluginForm({ id }: { id: string }) {
	const navigate = useNavigate()
	const editMutation = useMutation(editPlugin, {
		onSuccess: (data) => navigate(`/plugins/${data.data?.id}`),
	})
	const [name, setName] = useInputState('')
	const [html, setHtml] = useState('')
	const [js, setJs] = useState('')
	const [head, setHead] = useState('')
	const pluginQuery = useQuery([QueryKey.Plugin, id], () => getPlugin({ id }), {
		enabled: !!id,
		onSuccess: (data) => {
			setName(data.data?.name)
			setHtml(data.data?.html ?? '')
			setJs(data.data?.js ?? '')
			setHead(data.data?.head ?? '')
		},
	})
	const plugin = pluginQuery.data?.data

	if (pluginQuery.isLoading || !plugin) return <Loader mt="xl" size="xs" mx="auto" />

	return (
		<div className="space-y-6 pb-10">
			<TextInput
				mt="xl"
				label="Name"
				placeholder="Choose a name for the plugin"
				value={name}
				onChange={setName}
				style={{ width: 300 }}
			/>
			<CodeEditor
				defaultValue={plugin.html}
				title="HTML"
				language="html"
				onChange={setHtml}
			/>
			<CodeEditor
				defaultValue={plugin.js}
				title="JavaScript"
				language="javascript"
				onChange={setJs}
			/>
			<CodeEditor
				defaultValue={plugin.head}
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
