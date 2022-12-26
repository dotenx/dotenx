import { ActionIcon, Anchor, Loader } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { QueryKey } from '../../api'
import { deleteExtension, Extension, getExtensions } from './api'

export function ExtensionList({
	projectTag,
	projectName,
}: {
	projectTag: string
	projectName: string
}) {
	const extensionsQuery = useQuery(
		[QueryKey.Extensions, projectTag],
		() => getExtensions({ projectTag }),
		{ enabled: !!projectTag }
	)
	const extensions = extensionsQuery.data?.data ?? []

	if (extensionsQuery.isLoading) return <Loader size="xs" mx="auto" mt="xl" />
	if (extensions.length === 0) return <p className="mt-6">No extensions</p>

	return (
		<ul className="mt-6 space-y-4">
			{extensions.map((extension) => (
				<ExtensionItem
					key={extension.name}
					extension={extension}
					projectTag={projectTag}
					projectName={projectName}
				/>
			))}
		</ul>
	)
}

function ExtensionItem({
	extension,
	projectTag,
	projectName,
}: {
	extension: Extension
	projectTag: string
	projectName: string
}) {
	return (
		<li className="flex items-center justify-between px-2 py-1 rounded bg-gray-50">
			<Link to={`/extensions/${projectName}/${extension.name}`} className="hover:underline">
				{extension.name}
			</Link>
			<ExtensionActions
				name={extension.name}
				projectTag={projectTag}
				projectName={projectName}
			/>
		</li>
	)
}

export function ExtensionActions({
	name,
	projectTag,
	projectName,
}: {
	name: string
	projectTag: string
	projectName: string
}) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deleteExtension, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Extensions])
			navigate(`/extensions/${projectName}`)
		},
	})

	return (
		<div className="flex gap-1">
			<ActionIcon
				onClick={() => deleteMutation.mutate({ projectTag, name })}
				loading={deleteMutation.isLoading}
			>
				<TbTrash />
			</ActionIcon>
			<Anchor component={Link} to={`/extensions-edit/${projectName}/${name}`}>
				<ActionIcon>
					<TbPencil />
				</ActionIcon>
			</Anchor>
		</div>
	)
}
