import { ActionIcon, Anchor, Button, Group, Text, Tooltip } from '@mantine/core'
import { openConfirmModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import {
	TbAffiliate,
	TbArrowsMaximize,
	TbArrowsMinimize,
	TbCornerUpLeft,
	TbCornerUpRight,
} from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import { getGlobalStates, getPageDetails, getProjectDetails, QueryKey, updatePage } from '../../api'
import logoUrl from '../../assets/logo.png'
import { AnyJson } from '../../utils'
import { ADMIN_PANEL_URL } from '../../utils/constants'
import { toggleFullScreen } from '../../utils/toggle-fullscreen'
import { evaluateExpression } from '../data-source/data-source-form'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from '../selection/selection-store'
import { usePageStateStore } from '../states/page-states-store'
import { useClassesStore } from '../style/classes-store'
import { inteliToString } from '../ui/intelinput'
import { ViewportSelection } from '../viewport/viewport-selection'
import { globalStatesAtom, PageActions } from './actions'
import { PageSelection } from './page-selection'

export const pageModeAtom = atom<'none' | 'simple' | 'advanced'>('none')
export const previewAtom = atom({ isFullscreen: false })
export const projectTagAtom = atom('')
export const pageParamsAtom = atom<string[]>([])

export function TopBar() {
	useFetchProjectTag()
	useFetchGlobalStates()

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

export const useFetchProjectTag = () => {
	const { projectName = '' } = useParams()
	const setProjectTag = useSetAtom(projectTagAtom)
	const query = useQuery(
		[QueryKey.ProjectDetails, projectName],
		() => getProjectDetails({ projectName }),
		{
			onSuccess: (data) => setProjectTag(data.data.tag),
			enabled: !!projectName,
		}
	)
	return query.data?.data.tag
}

export const useFetchPage = () => {
	const projectTag = useFetchProjectTag() ?? ''
	const { pageName = '', projectName } = useParams()
	const setSelectedPage = useSetAtom(pageModeAtom)
	const resetCanvas = useElementsStore((store) => store.reset)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStateStore((store) => store.setState)
	const setClassNames = useClassesStore((store) => store.set)
	const setPageParams = useSetAtom(pageParamsAtom)
	const navigate = useNavigate()

	const query = useQuery(
		[QueryKey.PageDetails, projectTag, pageName],
		() => getPageDetails({ projectTag, pageName }),
		{
			onSuccess: (data) => {
				const { content } = data.data
				resetCanvas(content.layout)
				setDataSources(content.dataSources)
				setClassNames(content.classNames)
				setPageParams(content.pageParams)
				setSelectedPage(content.mode)

				content.dataSources.map((source) =>
					axios
						.request<AnyJson>({
							url: inteliToString(evaluateExpression(source.url)),
							method: source.method,
							data: source.body,
						})
						.then((data) => setPageState(source.stateName, data.data))
				)
			},
			onError: () => navigate(`/projects/${projectName}`),
			enabled: !!projectTag && !!pageName,
		}
	)

	return query
}

const useFetchGlobalStates = () => {
	const { projectName = '' } = useParams()
	const setGlobalStates = useSetAtom(globalStatesAtom)
	useQuery([QueryKey.GlobalStates, projectName], () => getGlobalStates({ projectName }), {
		onSuccess: (data) => setGlobalStates(data.data.states),
		enabled: !!projectName,
	})
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

	const { isFullscreen } = useAtomValue(previewAtom)

	return (
		<Tooltip
			withArrow
			label={<Text size="xs">{isFullscreen ? 'Edit' : 'Preview'}</Text>}
			offset={10}
		>
			<ActionIcon onClick={handleClick}>
				{isFullscreen ? <TbArrowsMinimize /> : <TbArrowsMaximize />}
			</ActionIcon>
		</Tooltip>
	)
}

function AdvancedModeButton() {
	const queryClient = useQueryClient()
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const { pageName = '' } = useParams()
	const projectTag = useAtomValue(projectTagAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const saveAdvanced = () => {
		savePageMutation.mutate({
			projectTag,
			pageName,
			elements,
			dataSources,
			classNames: classes,
			mode: 'advanced',
			pageParams: [],
			globals: [],
		})
	}
	const handleClick = () => {
		openConfirmModal({
			title: 'Please confirm your action',
			children: (
				<Text size="sm">
					This action is irreversible. Once you switch to advanced mode, you cannot use
					simple mode with this page anymore.
				</Text>
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
