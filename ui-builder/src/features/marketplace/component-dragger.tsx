import { ActionIcon, CloseButton } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Tb3DCubeSphere, TbTableExport } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { Component, deleteComponent, QueryKey } from '../../api'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { projectTagAtom } from '../page/top-bar'
import { ComponentMarketplaceForm } from './add-to-marketplace'
import { useComponents } from './use-components'

export function ComponentDragger() {
	const { components } = useComponents()

	return (
		<div className="grid grid-cols-3 gap-2">
			{components.map((component) => (
				<Draggable
					key={component.name}
					data={{ mode: DraggableMode.AddWithData, data: component.content }}
				>
					<ComponentCard component={component} />
				</Draggable>
			))}
		</div>
	)
}

function ComponentCard({ component }: { component: Component }) {
	const { projectName = '' } = useParams()
	const projectTag = useAtomValue(projectTagAtom)
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deleteComponent, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.Components]),
	})

	const openMarketplaceForm = () => {
		openModal({
			title: '',
			children: <ComponentMarketplaceForm component={component} projectName={projectName} />,
		})
	}

	return (
		<div className="flex flex-col items-center rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
			<div className="flex self-stretch justify-between">
				<ActionIcon title="Add to marketplace" size="xs" onClick={openMarketplaceForm}>
					<TbTableExport className="text-xs" />
				</ActionIcon>
				<CloseButton
					size="xs"
					title="Delete component"
					onClick={() => deleteMutation.mutate({ name: component.name, projectTag })}
					loading={deleteMutation.isLoading}
				/>
			</div>
			<Tb3DCubeSphere className="text-2xl" />
			<p className="pb-2 mt-2 text-xs text-center">{component.name}</p>
		</div>
	)
}
