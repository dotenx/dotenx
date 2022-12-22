import { ActionIcon, Anchor, Loader } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { QueryKey } from '../../api'
import { deleteExtension, Extension, getExtensions } from './api'

export function ExtensionList() {
	const extensionsQuery = useQuery([QueryKey.Extensions], getExtensions)
	const extensions = extensionsQuery.data?.data ?? []

	if (extensionsQuery.isLoading) return <Loader size="xs" mx="auto" mt="xl" />
	if (extensions.length === 0) return <p className="mt-6">No extensions</p>

	return (
		<ul className="mt-6 space-y-4">
			{extensions.map((extension) => (
				<ExtensionItem key={extension.id} extension={extension} />
			))}
		</ul>
	)
}

function ExtensionItem({ extension }: { extension: Extension }) {
	return (
		<li className="flex justify-between items-center bg-gray-50 rounded px-2 py-1">
			<Link to={`/extensions/${extension.id}`} className="hover:underline">
				{extension.name}
			</Link>
			<ExtensionActions id={extension.id} />
		</li>
	)
}

export function ExtensionActions({ id }: { id: string }) {
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deleteExtension, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.Extensions]),
	})

	return (
		<div className="flex gap-1">
			<ActionIcon
				onClick={() => deleteMutation.mutate({ id })}
				loading={deleteMutation.isLoading}
			>
				<TbTrash />
			</ActionIcon>
			<Anchor component={Link} to={`/extensions-edit/${id}`}>
				<ActionIcon>
					<TbPencil />
				</ActionIcon>
			</Anchor>
		</div>
	)
}
