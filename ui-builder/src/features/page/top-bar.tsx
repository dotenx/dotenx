import { ActionIcon, Anchor, Button, Text, Tooltip } from '@mantine/core'
import { openConfirmModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { TbArrowRampLeft3, TbArrowsMaximize, TbCornerUpLeft, TbCornerUpRight } from 'react-icons/tb'
import { useMatch, useNavigate } from 'react-router-dom'
import { getPageDetails, getProjectDetails, publishPage, QueryKey, updatePage } from '../../api'
import logoUrl from '../../assets/logo.png'
import { AnyJson } from '../../utils'
import { toggleFullScreen } from '../../utils/toggle-fullscreen'
import { useDataSourceStore } from '../data-bindings/data-source-store'
import { usePageStates } from '../data-bindings/page-states'
import { useElementsStore } from '../elements/elements-store'
import { useClassesStore } from '../style/classes-store'
import { DeviceSelection } from '../viewport/device-selection'
import { PageActions } from './actions'
import { PageSelection } from './page-selection'

export const selectedPageAtom = atom({ exists: false, route: '' })
export const fullScreenAtom = atom({ isFullscreen: false })
export const projectTagAtom = atom('')

export function TopBar({ projectName }: { projectName: string }) {
	const [projectTag, setProjectTag] = useAtom(projectTagAtom)
	useQuery([QueryKey.ProjectDetails, projectName], () => getProjectDetails({ projectName }), {
		enabled: !!projectName,
		onSuccess: (data) => setProjectTag(data.data.tag),
	})
	const selectedPage = useAtomValue(selectedPageAtom)
	const { elements, resetCanvas, history, historyIndex, redo, undo } = useElementsStore(
		(store) => ({
			elements: store.elements,
			resetCanvas: store.reset,
			history: store.history,
			historyIndex: store.historyIndex,
			undo: store.undo,
			redo: store.redo,
		})
	)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStates((store) => store.setState)
	const setClassNames = useClassesStore((store) => store.set)
	const navigate = useNavigate()
	const isSimple = useMatch('/projects/:projectName/simple')

	useQuery(
		[QueryKey.PageDetails, projectTag, selectedPage],
		() => getPageDetails({ projectTag, pageName: selectedPage.route }),
		{
			onSuccess: (data) => {
				const { content } = data.data
				resetCanvas(content.layout)
				setDataSources(content.dataSources)
				setClassNames(content.classNames)
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
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const queryClient = useQueryClient()
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const saveAdvanced = () =>
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			elements,
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
						disabled={historyIndex === history.length - 1}
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
