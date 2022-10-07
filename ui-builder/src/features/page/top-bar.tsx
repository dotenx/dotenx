import { ActionIcon, Anchor, Button, Group, Text, Tooltip } from '@mantine/core'
import { openConfirmModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { TbAffiliate, TbArrowsMaximize, TbCornerUpLeft, TbCornerUpRight } from 'react-icons/tb'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
import { getPageDetails, getProjectDetails, QueryKey, updatePage } from '../../api'
import logoUrl from '../../assets/logo.png'
import { AnyJson } from '../../utils'
import { ADMIN_PANEL_URL } from '../../utils/constants'
import { toggleFullScreen } from '../../utils/toggle-fullscreen'
import { useDataSourceStore } from '../data-bindings/data-source-store'
import { usePageStates } from '../data-bindings/page-states'
import { useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from '../selection/selection-store'
import { useClassesStore } from '../style/classes-store'
import { ViewportSelection } from '../viewport/viewport-selection'
import { PageActions } from './actions'
import { PageSelection } from './page-selection'

export const selectedPageAtom = atom({ exists: false, route: '' })
export const previewAtom = atom({ isFullscreen: false })
export const projectTagAtom = atom('')

export function TopBar() {
	useFetchProjectTag()
	useFetchPage()

	return (
		<Group align="center" spacing="xl" position="apart" px="xl" className="h-full">
			<Group align="center" spacing="xl">
				<Logo />
				<PageSelection />
				<ViewportSelection />
				<PreviewButton />
				<AdvancedModeButton />
			</Group>
			<Group align="center" spacing="xl">
				<UndoRedo />
				<PageActions />
			</Group>
		</Group>
	)
}

const useFetchProjectTag = () => {
	const { projectName = '' } = useParams()
	const setProjectTag = useSetAtom(projectTagAtom)
	useQuery([QueryKey.ProjectDetails, projectName], () => getProjectDetails({ projectName }), {
		onSuccess: (data) => setProjectTag(data.data.tag),
		enabled: !!projectName,
	})
}

const useFetchPage = () => {
	const navigate = useNavigate()
	const { projectName = '' } = useParams()
	const isSimple = useMatch('/projects/:projectName/simple')
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
	const resetCanvas = useElementsStore((store) => store.reset)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStates((store) => store.setState)
	const setClassNames = useClassesStore((store) => store.set)

	useQuery(
		[QueryKey.PageDetails, projectTag, selectedPage.route],
		() => getPageDetails({ projectTag, pageName: selectedPage.route }),
		{
			onSuccess: (data) => {
				const { content } = data.data
				resetCanvas(content.layout)
				setDataSources(content.dataSources)
				setClassNames(content.classNames)
				content.dataSources.map((source) =>
					axios
						.request<AnyJson>({
							url: source.url,
							method: source.method,
							data: source.body,
						})
						.then((data) => setPageState(`$store-${source.stateName}`, data.data))
				)
				if (content.mode === 'simple' && !isSimple)
					navigate(`/projects/${projectName}/simple`)
				else if (content.mode === 'advanced' && isSimple)
					navigate(`/projects/${projectName}`)
			},
			enabled: !!projectTag && selectedPage.exists,
		}
	)
}

function Logo() {
	return (
		<Tooltip withArrow label={<Text size="xs">Dashboard</Text>}>
			<Anchor href={ADMIN_PANEL_URL}>
				<img src={logoUrl} className="w-8" alt="dotenx logo" />
			</Anchor>
		</Tooltip>
	)
}

function PreviewButton() {
	const setPreview = useSetAtom(previewAtom)
	const deselect = useSelectionStore((store) => store.deselect)
	const handleClick = () => {
		toggleFullScreen()
		setPreview((prev) => ({ isFullscreen: !prev.isFullscreen }))
		deselect()
	}

	return (
		<Tooltip withArrow label={<Text size="xs">Preview</Text>} offset={10}>
			<ActionIcon onClick={handleClick}>
				<TbArrowsMaximize />
			</ActionIcon>
		</Tooltip>
	)
}

function AdvancedModeButton() {
	const queryClient = useQueryClient()
	const isSimple = useMatch('/projects/:projectName/simple')
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const saveAdvanced = () => {
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			elements,
			dataSources,
			classNames: classes,
			mode: 'advanced',
		})
	}
	const handleClick = () => {
		openConfirmModal({
			title: 'Please confirm your action',
			children: (
				<Text size="sm">This action is irreversible. It will toggle advanced mode.</Text>
			),
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: saveAdvanced,
		})
	}

	if (!isSimple) return null

	return (
		<Tooltip withArrow label={<Text size="xs">Advanced mode</Text>} offset={10}>
			<ActionIcon onClick={handleClick}>
				<TbAffiliate />
			</ActionIcon>
		</Tooltip>
	)
}

function UndoRedo() {
	const { history, historyIndex, redo, undo } = useElementsStore((store) => ({
		history: store.history,
		historyIndex: store.historyIndex,
		undo: store.undo,
		redo: store.redo,
	}))
	const disableUndo = historyIndex === -1
	const disableRedo = historyIndex === history.length - 1

	return (
		<Button.Group>
			<Button onClick={undo} size="xs" disabled={disableUndo} variant="default">
				<TbCornerUpLeft className="text-sm" />
			</Button>
			<Button onClick={redo} size="xs" disabled={disableRedo} variant="default">
				<TbCornerUpRight className="text-sm" />
			</Button>
		</Button.Group>
	)
}
