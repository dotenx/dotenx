import { Button, Text, Tooltip } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { TbDeviceFloppy, TbTrash, TbWorldUpload } from 'react-icons/tb'
import { useMatch } from 'react-router-dom'
import { deletePage, PublishPageRequest, QueryKey, updatePage } from '../../api'
import { useDataSourceStore } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useClassesStore } from '../style/classes-store'
import { selectedPageAtom } from './top-bar'

export function PageActions({
	projectTag,
	handlePublish,
	isPublishing,
}: {
	projectTag: string
	handlePublish: (payload: PublishPageRequest) => void
	isPublishing: boolean
}) {
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const queryClient = useQueryClient()
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => setSelectedPage({ exists: true, route: selectedPage.route }),
	})
	const { elements, resetCanvas } = useElementsStore((store) => ({
		elements: store.elements,
		resetCanvas: store.reset,
	}))
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			resetCanvas()
		},
	})
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const isSimple = useMatch('/projects/:projectName/simple')

	const save = () =>
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			elements,
			dataSources,
			classNames,
			mode: isSimple ? 'simple' : 'advanced',
		})
	const publish = () => handlePublish({ projectTag, pageName: selectedPage.route })
	const remove = () => deletePageMutation.mutate({ projectTag, pageName: selectedPage.route })

	return (
		<Button.Group>
			<Tooltip
				withinPortal
				withArrow
				disabled={!selectedPage.exists}
				label={<Text size="xs">Delete Page</Text>}
			>
				<Button
					onClick={remove}
					loading={deletePageMutation.isLoading}
					size="xs"
					fullWidth
					styles={{ inner: { justifyContent: 'start' } }}
					disabled={!selectedPage.exists}
					variant="default"
				>
					<TbTrash className="text-sm" />
				</Button>
			</Tooltip>
			<Tooltip withinPortal withArrow label={<Text size="xs">Save Page</Text>}>
				<Button
					onClick={save}
					loading={savePageMutation.isLoading}
					size="xs"
					fullWidth
					styles={{ inner: { justifyContent: 'start' } }}
					variant="default"
				>
					<TbDeviceFloppy className="text-sm" />
				</Button>
			</Tooltip>
			<Tooltip
				disabled={!selectedPage.exists}
				withinPortal
				withArrow
				label={<Text size="xs">Publish Page</Text>}
			>
				<Button
					onClick={publish}
					loading={isPublishing}
					size="xs"
					fullWidth
					styles={{ inner: { justifyContent: 'start' } }}
					disabled={!selectedPage.exists}
				>
					<TbWorldUpload className="text-sm" />
				</Button>
			</Tooltip>
		</Button.Group>
	)
}
