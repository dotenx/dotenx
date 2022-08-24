import { ActionIcon, Button, Divider, Menu, SegmentedControl, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import {
	TbDeviceDesktop,
	TbDeviceFloppy,
	TbDeviceMobile,
	TbDeviceTablet,
	TbSettings,
	TbTrash,
	TbWorldUpload,
} from 'react-icons/tb'
import { z } from 'zod'
import {
	addPage,
	deletePage,
	getPageDetails,
	getPages,
	getProjectDetails,
	publishPage,
	QueryKey,
	updatePage,
} from '../api/api'
import { AnyJson } from '../utils'
import { useCanvasStore } from './canvas-store'
import { useDataSourceStore } from './data-source-store'
import { usePageStates } from './page-states'
import { useViewportStore, ViewportDevice } from './viewport-store'

const selectedPageAtom = atom('')

export function TopBar({ projectName }: { projectName: string }) {
	const projectDetailsQuery = useQuery(
		[QueryKey.ProjectDetails, projectName],
		() => getProjectDetails({ projectName }),
		{ enabled: !!projectName }
	)
	const projectTag = projectDetailsQuery.data?.data.tag ?? ''
	const selectedPage = useAtomValue(selectedPageAtom)
	const setComponents = useCanvasStore((store) => store.set)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStates((store) => store.setState)
	useQuery(
		[QueryKey.PageDetails, projectTag, selectedPage],
		() => getPageDetails({ projectTag, pageName: selectedPage }),
		{
			onSuccess: (data) => {
				const { content } = data.data
				setComponents(content.layout)
				setDataSources(content.dataSources)
				// TODO: needs optimization
				content.dataSources.map((source) =>
					axios
						.get<AnyJson>(source.url)
						.then((data) => setPageState(source.stateName, data.data))
				)
			},
			enabled: !!projectTag && !!selectedPage,
		}
	)

	return (
		<div className="flex items-center justify-between h-full px-6">
			<div className="flex items-center gap-6">
				<PageSelection projectTag={projectTag} />
				<DeviceSelection />
			</div>
			<PageActions projectTag={projectTag} />
		</div>
	)
}

function PageSelection({ projectTag }: { projectTag: string }) {
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const [menuOpened, setMenuOpened] = useState(false)
	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		onSuccess: (data) => {
			const pages = data.data ?? []
			const firstPage = pages[0] ?? 'index'
			setSelectedPage(firstPage)
		},
		enabled: !!projectTag,
	})
	const pages = pagesQuery.data?.data ?? []
	const closeMenu = () => setMenuOpened(false)

	const pageList = pages.map((page) => (
		<Menu.Item key={page} onClick={() => setSelectedPage(page)}>
			/{page}
		</Menu.Item>
	))

	return (
		<Menu opened={menuOpened} onChange={setMenuOpened} width={260} shadow="sm">
			<Menu.Target>
				<Button
					variant="subtle"
					size="xs"
					sx={{ minWidth: 260 }}
					loading={pagesQuery.isLoading}
					title="Page"
				>
					{`/${selectedPage}`}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>Page</Menu.Label>
				{pageList}
				<Divider label="or add a new page" labelPosition="center" />
				<AddPageForm projectTag={projectTag} onSuccess={closeMenu} />
			</Menu.Dropdown>
		</Menu>
	)
}

const deviceOptions = [
	{
		label: <TbDeviceDesktop size={18} title="Desktop view" />,
		value: 'desktop',
	},
	{
		label: <TbDeviceTablet size={18} title="Tablet view" />,
		value: 'tablet',
	},
	{
		label: <TbDeviceMobile size={18} title="Mobile view" />,
		value: 'mobile',
	},
]

function DeviceSelection() {
	const { viewport, changeViewport } = useViewportStore((store) => ({
		viewport: store.device,
		changeViewport: store.change,
	}))

	return (
		<SegmentedControl
			value={viewport}
			onChange={(value: ViewportDevice) => changeViewport(value)}
			size="xs"
			data={deviceOptions}
		/>
	)
}

function PageActions({ projectTag }: { projectTag: string }) {
	const queryClient = useQueryClient()
	const pageName = useAtomValue(selectedPageAtom)
	const savePageMutation = useMutation(updatePage)
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.Pages]),
	})
	const components = useCanvasStore((store) => store.components)
	const dataSources = useDataSourceStore((store) => store.sources)
	const publishPageMutation = useMutation(publishPage)
	const save = () => savePageMutation.mutate({ projectTag, pageName, components, dataSources })
	const publish = () => publishPageMutation.mutate({ projectTag, pageName })
	const remove = () => deletePageMutation.mutate({ projectTag, pageName })

	return (
		<Menu position="bottom-end" width={120} shadow="sm">
			<Menu.Target>
				<ActionIcon color="rose" title="Page actions">
					<TbSettings className="text-lg" />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<div className="space-y-1">
					<Button
						onClick={save}
						loading={savePageMutation.isLoading}
						variant="subtle"
						size="xs"
						leftIcon={<TbDeviceFloppy className="text-sm" />}
						fullWidth
						styles={{ inner: { justifyContent: 'start' } }}
					>
						Save
					</Button>
					<Button
						onClick={publish}
						loading={publishPageMutation.isLoading}
						variant="subtle"
						size="xs"
						leftIcon={<TbWorldUpload className="text-sm" />}
						fullWidth
						styles={{ inner: { justifyContent: 'start' } }}
					>
						Publish
					</Button>
					<Button
						onClick={remove}
						loading={deletePageMutation.isLoading}
						variant="subtle"
						size="xs"
						leftIcon={<TbTrash className="text-sm" />}
						fullWidth
						styles={{ inner: { justifyContent: 'start' } }}
					>
						Delete
					</Button>
				</div>
			</Menu.Dropdown>
		</Menu>
	)
}

const schema = z.object({ pageName: z.string().min(2).max(20) })

function AddPageForm({ projectTag, onSuccess }: { projectTag: string; onSuccess: () => void }) {
	const queryClient = useQueryClient()
	const addPageMutation = useMutation(addPage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			onSuccess()
		},
	})
	const form = useForm({ initialValues: { pageName: '' }, validate: zodResolver(schema) })
	const onSubmit = form.onSubmit((values) => {
		addPageMutation.mutate({
			projectTag,
			pageName: values.pageName,
			components: [],
			dataSources: [],
		})
	})

	return (
		<form onSubmit={onSubmit} className="p-1">
			<TextInput size="xs" label="Page name" {...form.getInputProps('pageName')} />
			<Button type="submit" size="xs" mt="xs" fullWidth loading={addPageMutation.isLoading}>
				Add Page
			</Button>
		</form>
	)
}
