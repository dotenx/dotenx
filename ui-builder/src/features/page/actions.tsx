import { Anchor, Button, Text, Tooltip } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { TbCheck, TbDeviceFloppy, TbTrash, TbWorldUpload } from 'react-icons/tb'
import { useMatch } from 'react-router-dom'
import { deletePage, publishPage, QueryKey, updatePage } from '../../api'
import { useDataSourceStore } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useClassesStore } from '../style/classes-store'
import { projectTagAtom, selectedPageAtom } from './top-bar'

export function PageActions() {
	return (
		<Button.Group>
			<DeleteButton />
			<SaveButton />
			<PublishButton />
		</Button.Group>
	)
}

function DeleteButton() {
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
	const resetElements = useElementsStore((store) => store.reset)
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			resetElements()
		},
	})
	const remove = () => deletePageMutation.mutate({ projectTag, pageName: selectedPage.route })

	return (
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
				disabled={!selectedPage.exists}
				variant="default"
			>
				<TbTrash className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function SaveButton() {
	const isSimple = useMatch('/projects/:projectName/simple')
	const projectTag = useAtomValue(projectTagAtom)
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => setSelectedPage({ exists: true, route: selectedPage.route }),
	})
	const save = () => {
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			elements,
			dataSources,
			classNames,
			mode: isSimple ? 'simple' : 'advanced',
		})
	}

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Save Page</Text>}>
			<Button onClick={save} loading={savePageMutation.isLoading} size="xs" variant="default">
				<TbDeviceFloppy className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function PublishButton() {
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
	const publishPageMutation = useMutation(publishPage, {
		onSuccess: (data) => {
			showNotification({
				title: 'Page published',
				message: <PublishedUrl url={data.data.url} />,
				color: 'green',
				icon: <TbCheck size={18} />,
			})
		},
	})
	const publish = () => publishPageMutation.mutate({ projectTag, pageName: selectedPage.route })

	return (
		<Tooltip
			disabled={!selectedPage.exists}
			withinPortal
			withArrow
			label={<Text size="xs">Publish Page</Text>}
		>
			<Button
				onClick={publish}
				loading={publishPageMutation.isLoading}
				size="xs"
				disabled={!selectedPage.exists}
			>
				<TbWorldUpload className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function PublishedUrl({ url }: { url: string }) {
	return (
		<Anchor weight={500} target="_blank" size="xs" rel="noopener noreferrer" href={url}>
			View
		</Anchor>
	)
}
