import { ActionIcon } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { TbTrash } from 'react-icons/tb'
import { Link, useParams } from 'react-router-dom'
import { deletePage, QueryKey } from '../../api'
import { projectTagAtom } from './top-bar'

export function PageList({ pages }: { pages: string[] }) {
	const { projectName = '' } = useParams()

	return (
		<div className="space-y-4">
			{pages
				.filter((page) => !!page)
				.map((page) => (
					<div key={page} className="rounded-md border flex items-center justify-between">
						<Link
							to={`/projects/${projectName}/${page}`}
							className="block grow px-3 py-2 hover:bg-gray-50 transition rounded-l-md"
						>
							{page}
						</Link>
						<DeletePageButton pageName={page} />
					</div>
				))}
		</div>
	)
}

export function DeletePageButton({ pageName }: { pageName: string }) {
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.Pages]),
	})
	const remove = () => deletePageMutation.mutate({ projectTag, pageName })

	return (
		<ActionIcon onClick={remove} loading={deletePageMutation.isLoading} mx="xs">
			<TbTrash />
		</ActionIcon>
	)
}
