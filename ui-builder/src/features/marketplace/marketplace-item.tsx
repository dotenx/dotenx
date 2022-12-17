import { closeAllModals } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Tb3DCubeSphere } from 'react-icons/tb'
import { importFromMarketplace, QueryKey } from '../../api'
import { projectTagAtom } from '../page/top-bar'

export function MarketplaceComponent({
	id,
	title,
	category,
	imageUrl,
}: {
	id: number
	title: string
	imageUrl: string
	category: string
}) {
	const queryClient = useQueryClient()
	const importComponentMutation = useMutation(importFromMarketplace, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Components])
			queryClient.invalidateQueries([QueryKey.DesignSystems])
			closeAllModals()
		},
	})
	const projectTag = useAtomValue(projectTagAtom)

	return (
		<div
			className="p-2 w-full h-44  border rounded bg-white cursor-pointer"
			onClick={() =>
				importComponentMutation.mutate({ projectTag, itemId: id, name: title, category })
			}
		>
			<div className="flex w-full justify-center items-center  h-32 ">
				{imageUrl ? (
					<img src={imageUrl} className="max-h-full max-w-full" />
				) : (
					<Tb3DCubeSphere className="h-full w-full" />
				)}
			</div>
			<div className="pt-1 pb-2 text-center text-base">{title}</div>
		</div>
	)
}
