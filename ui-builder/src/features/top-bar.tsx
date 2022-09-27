import {
	ActionIcon,
	Anchor,
	Button,
	Divider,
	Menu,
	SegmentedControl,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { openConfirmModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import {
	TbArrowRampLeft3,
	TbArrowsMaximize,
	TbCornerUpLeft,
	TbCornerUpRight,
	TbDeviceDesktop,
	TbDeviceFloppy,
	TbDeviceMobile,
	TbDeviceTablet,
	TbTrash,
	TbWorldUpload,
} from 'react-icons/tb'
import { useMatch, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PublishPageRequest } from '../api'
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
import logoUrl from '../assets/logo.png'
import { AnyJson } from '../utils'
import { useCanvasStore } from './canvas-store'
import { useClassNamesStore } from './class-names-store'
import { useDataSourceStore } from './data-source-store'
import { usePageStates } from './page-states'
import { projectTagAtom } from './project-atom'
import { useViewportStore, ViewportDevice } from './viewport-store'

const selectedPageAtom = atom({ exists: false, route: '' })
export const fullScreenAtom = atom({ isFullscreen: false })

export function TopBar({ projectName }: { projectName: string }) {
	const [projectTag, setProjectTag] = useAtom(projectTagAtom)
	useQuery([QueryKey.ProjectDetails, projectName], () => getProjectDetails({ projectName }), {
		enabled: !!projectName,
		onSuccess: (data) => setProjectTag(data.data.tag),
	})
	const selectedPage = useAtomValue(selectedPageAtom)
	const { setComponents, history, historyIndex, redo, undo } = useCanvasStore((store) => ({
		setComponents: store.set,
		historyIndex: store.historyIndex,
		history: store.history,
		undo: store.undo,
		redo: store.redo,
	}))
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStates((store) => store.setState)
	const setClassNames = useClassNamesStore((store) => store.set)
	const navigate = useNavigate()
	const isSimple = useMatch('/projects/:projectName/simple')

	useQuery(
		[QueryKey.PageDetails, projectTag, selectedPage],
		() => getPageDetails({ projectTag, pageName: selectedPage.route }),
		{
			onSuccess: (data) => {
				const { content } = data.data
				setComponents(content.layout)
				setDataSources(content.dataSources)
				setClassNames(content.classNames)
				// TODO: needs optimization
				content.dataSources.map((source) =>
					axios
						.get<AnyJson>(source.url)
						.then((data) => setPageState(source.stateName, data.data))
				)
				if (content.mode === 'simple' && !isSimple)
					navigate(`/projects/${projectName}/simple`)
				else if (content.mode === 'advanced' && isSimple)
					navigate(`/projects/${projectName}`)
			},
			enabled: !!projectTag && !!selectedPage.route,
		}
	)
	const publishPageMutation = useMutation(publishPage)
	const publishedUrl = publishPageMutation.data?.data.url
	const setFullscreen = useSetAtom(fullScreenAtom)
	const components = useCanvasStore((store) => store.components)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassNamesStore((store) => store.classNames)
	const queryClient = useQueryClient()
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const saveAdvanced = () =>
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			components,
			dataSources,
			classNames,
			mode: 'advanced',
		})

	return (
		<div className="flex items-center justify-between h-full px-6">
			<div className="flex items-center gap-6">
				<Tooltip withArrow label={<Text size="xs">Dashboard</Text>}>
					<Anchor href={import.meta.env.VITE_ADMIN_PANEL_URL}>
						<img src={logoUrl} className="w-8" alt="logo" />
					</Anchor>
				</Tooltip>
				<PageSelection projectTag={projectTag} projectName={projectName} />
				<DeviceSelection />
				<ActionIcon
					title="Fullscreen preview"
					onClick={() => {
						toggleFullScreen()
						setFullscreen((prev) => ({ isFullscreen: !prev.isFullscreen }))
					}}
				>
					<TbArrowsMaximize />
				</ActionIcon>
				{isSimple && (
					<ActionIcon
						title="Toggle advance mode"
						onClick={() =>
							openConfirmModal({
								title: 'Please confirm your action',
								children: (
									<Text size="sm">
										This action is irreversible. It will toggle advanced mode.
									</Text>
								),
								labels: { confirm: 'Confirm', cancel: 'Cancel' },
								onConfirm: () => saveAdvanced(),
							})
						}
					>
						<TbArrowRampLeft3 />
					</ActionIcon>
				)}
			</div>
			<div className="flex gap-6 items-center">
				{publishedUrl && (
					<Anchor
						weight={500}
						target="_blank"
						size="xs"
						rel="noopener noreferrer"
						href={publishedUrl}
					>
						View Published Page
					</Anchor>
				)}
				<Button.Group>
					<Button
						onClick={undo}
						size="xs"
						fullWidth
						styles={{ inner: { justifyContent: 'start' } }}
						disabled={historyIndex === -1}
						variant="default"
					>
						<TbCornerUpLeft className="text-sm" />
					</Button>
					<Button
						onClick={redo}
						size="xs"
						fullWidth
						styles={{ inner: { justifyContent: 'start' } }}
						disabled={historyIndex >= history.length - 1}
						variant="default"
					>
						<TbCornerUpRight className="text-sm" />
					</Button>
				</Button.Group>
				<PageActions
					projectTag={projectTag}
					handlePublish={publishPageMutation.mutate}
					isPublishing={publishPageMutation.isLoading}
				/>
			</div>
		</div>
	)
}

function PageSelection({ projectTag, projectName }: { projectTag: string; projectName: string }) {
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const [menuOpened, setMenuOpened] = useState(false)
	const navigate = useNavigate()
	const isSimple = useMatch('/projects/:projectName/simple')
	const pagesQuery = useQuery([QueryKey.Pages, projectTag], () => getPages({ projectTag }), {
		onSuccess: (data) => {
			const pages = data.data ?? []
			const firstPage = pages[0] ?? 'index'
			setSelectedPage({ exists: !!pages[0], route: firstPage })
			if (pages.length === 0 && !isSimple) navigate(`/projects/${projectName}/simple`)
		},
		enabled: !!projectTag,
	})
	const pages = pagesQuery.data?.data ?? []
	const closeMenu = () => setMenuOpened(false)

	const pageList = pages.map((page) => (
		<Menu.Item key={page} onClick={() => setSelectedPage({ exists: true, route: page })}>
			/{page}
		</Menu.Item>
	))

	return (
		<Menu opened={menuOpened} onChange={setMenuOpened} width={260} shadow="sm">
			<Menu.Target>
				<Button
					variant="light"
					size="xs"
					sx={{ minWidth: 200 }}
					loading={pagesQuery.isLoading}
				>
					{`/${selectedPage.route}`}
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

function PageActions({
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
	const { components, set } = useCanvasStore((store) => ({
		components: store.components,
		set: store.set,
	}))
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			set([])
		},
	})
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassNamesStore((store) => store.classNames)
	const isSimple = useMatch('/projects/:projectName/simple')

	const save = () =>
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			components,
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

const schema = z.object({
	pageName: z
		.string()
		.min(2)
		.max(20)
		.regex(/^[a-z0-9-]+$/i, {
			message: 'Page name can only contain lowercase letters, numbers and dashes',
		}),
})

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
			classNames: {},
			mode: 'simple',
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

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen()
	} else if (document.exitFullscreen) {
		document.exitFullscreen()
	}
}
