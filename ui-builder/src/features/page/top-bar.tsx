import { ActionIcon, Anchor, Button, Group, Text, Tooltip } from '@mantine/core'
import { openConfirmModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import hash from 'object-hash'
import { ReactNode, useEffect, useMemo } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import {
	TbAffiliate,
	TbArrowsMaximize,
	TbArrowsMinimize,
	TbCornerUpLeft,
	TbCornerUpRight,
	TbZoomIn,
	TbZoomOut,
} from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import { getGlobalStates, getPageDetails, getProjectDetails, QueryKey, updatePage } from '../../api'
import logoUrl from '../../assets/logo.png'
import { AnyJson } from '../../utils'
import { ADMIN_PANEL_URL } from '../../utils/constants'
import { toggleFullScreen } from '../../utils/toggle-fullscreen'
import { animationsAtom } from '../atoms'
import { evaluateExpression } from '../data-source/data-source-form'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from '../selection/selection-store'
import { statesDefaultValuesAtom } from '../states/default-values-form'
import { usePageStateStore } from '../states/page-states-store'
import { useClassesStore } from '../style/classes-store'
import { fontsAtom } from '../style/typography-editor'
import { inteliToString } from '../ui/intelinput'
import { ViewportSelection } from '../viewport/viewport-selection'
import { customCodesAtom, globalStatesAtom, PageActions } from './actions'
import { PageSelection } from './page-selection'
import { useProjectStore } from './project-store'

export const pageModeAtom = atom<'none' | 'simple' | 'advanced'>('none')
export const previewAtom = atom({ isFullscreen: false })
export const projectTagAtom = atom('')
export const pageParamsAtom = atom<string[]>([])

export function TopBar() {
	return (
		<TopBarWrapper
			left={
				<>
					<Logo />
					<BackToBackEnd />
					<PageSelection />
					<ViewportSelection />
					<FullscreenButton />
					<AdvancedModeButton />
					<UnsavedMessage />
				</>
			}
			right={
				<>
					<PageScaling />
					<UndoRedo />
					<PageActions />
				</>
			}
		/>
	)
}

export function TopBarWrapper({ left, right }: { left: ReactNode; right: ReactNode }) {
	return (
		<Group align="center" spacing="xl" position="apart" px="xl" className="h-full">
			<Group align="center" spacing="xl">
				{left}
			</Group>
			<Group align="center" spacing="xl">
				{right}
			</Group>
		</Group>
	)
}

export const useHasUnsavedChanges = () => {
	const elements = useElementsStore((store) => store.elements)
	const saved = useElementsStore((store) => store.saved)
	const savedHash = useMemo(() => safeHash(saved), [saved])
	const currentHash = useMemo(() => safeHash(elements), [elements])
	return savedHash !== currentHash
}

export function UnsavedMessage() {
	const unsaved = useHasUnsavedChanges()

	useEffect(() => {
		if (import.meta.env.MODE === 'development') return
		const beforeUnloadListener = (event: BeforeUnloadEvent): string => {
			event.preventDefault()
			return (event.returnValue = '')
		}
		if (!unsaved) return
		addEventListener('beforeunload', beforeUnloadListener, { capture: true })
		return () => removeEventListener('beforeunload', beforeUnloadListener, { capture: true })
	}, [unsaved])

	if (!unsaved) return null

	return (
		<Text color="dimmed" size="xs">
			You have unsaved changes
		</Text>
	)
}

const safeHash = (object: hash.NotUndefined) => {
	try {
		return hash(object)
	} catch (error) {
		console.warn({ object }, error)
	}
}

export const pageScaleAtom = atom(1)

export function PageScaling() {
	const [scale, setScale] = useAtom(pageScaleAtom)

	return (
		<Button.Group>
			<Button
				onClick={() => setScale((scale) => scale - 0.1)}
				size="xs"
				disabled={scale <= 0.6}
				variant="default"
			>
				<TbZoomOut className="w-5 h-5" />
			</Button>
			<Button
				onClick={() => setScale((scale) => scale + 0.1)}
				size="xs"
				disabled={scale >= 1}
				variant="default"
			>
				<TbZoomIn className="w-5 h-5" />
			</Button>
		</Button.Group>
	)
}

export const useFetchProjectTag = () => {
	const setTag = useProjectStore((store) => store.setTag)
	const { projectName = '' } = useParams()
	const setProjectTag = useSetAtom(projectTagAtom)
	const query = useQuery(
		[QueryKey.ProjectDetails, projectName],
		() => getProjectDetails({ projectName }),
		{
			onSuccess: (data) => {
				setProjectTag(data.data.tag)
				setTag(data.data.tag)
			},
			enabled: !!projectName,
		}
	)
	return query.data?.data.tag
}

export const useFetchPage = () => {
	const projectTag = useProjectStore((store) => store.tag)
	const { pageName = '', projectName } = useParams()
	const setSelectedPage = useSetAtom(pageModeAtom)
	const resetCanvas = useElementsStore((store) => store.reset)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStateStore((store) => store.setState)
	const setClassNames = useClassesStore((store) => store.set)
	const setPageParams = useSetAtom(pageParamsAtom)
	const navigate = useNavigate()
	const setFonts = useSetAtom(fontsAtom)
	const setCustomCodes = useSetAtom(customCodesAtom)
	const setStatesDefaultValues = useSetAtom(statesDefaultValuesAtom)
	const setAnimations = useSetAtom(animationsAtom)

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
				setFonts(content.fonts)
				setCustomCodes(content?.customCodes ?? { head: '', footer: '' })
				setStatesDefaultValues(content.statesDefaultValues ?? {})
				setAnimations(content.animations ?? [])
				content.dataSources.map((source) =>
					axios
						.request<AnyJson>({
							url: inteliToString(evaluateExpression(source.url)),
							method: source.method,
							data: inteliToString(evaluateExpression(source.body)),
						})
						.then((data) => setPageState(source.stateName, data.data))
				)
			},
			onError: () => navigate(`/projects/${projectName}/index`),
			enabled: !!projectTag && !!pageName,
		}
	)

	return query
}

export const useFetchGlobalStates = () => {
	const { projectName = '' } = useParams()
	const setGlobalStates = useSetAtom(globalStatesAtom)
	useQuery([QueryKey.GlobalStates, projectName], () => getGlobalStates({ projectName }), {
		onSuccess: (data) => setGlobalStates(data.data.states),
		enabled: !!projectName,
	})
}

export function Logo() {
	return (
		<Tooltip withArrow label={<Text size="xs">Dashboard</Text>}>
			<Anchor href={ADMIN_PANEL_URL}>
				<img src={logoUrl} className="w-8" alt="dotenx logo" />
			</Anchor>
		</Tooltip>
	)
}

function BackToBackEnd() {
	const { projectName = '' } = useParams()

	return (
		<Tooltip withArrow label={<Text size="xs">Backend builder</Text>}>
			<a
				href={`${
					import.meta.env.VITE_BACKEND_BUILDER_URL
				}/builder/projects/${projectName}/tables`}
				rel="noopener noreferrer"
				target={'_blank'}
			>
				<ActionIcon color="rose" variant="filled">
					<IoArrowBack className="w-4 h-4" />
				</ActionIcon>
			</a>
		</Tooltip>
	)
}

export function FullscreenButton() {
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
			label={<Text size="xs">{isFullscreen ? 'Edit' : 'Expand'}</Text>}
			offset={10}
		>
			<ActionIcon onClick={handleClick}>
				{isFullscreen ? (
					<TbArrowsMinimize className="w-5 h-5" />
				) : (
					<TbArrowsMaximize className="w-5 h-5" />
				)}
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
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const setSaved = useElementsStore((store) => store.save)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.PageDetails])
			setSaved()
		},
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
			fonts: {},
			customCodes: { head: '', footer: '' },
			statesDefaultValues,
			animations: [],
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
		<Tooltip withArrow label={<Text size="xs">Switch to the advanced mode</Text>} offset={10}>
			<ActionIcon onClick={handleClick}>
				<TbAffiliate className="w-5 h-5" />
			</ActionIcon>
		</Tooltip>
	)
}

export function UndoRedo() {
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
			<Button onClick={undo} size="xs" disabled={disableUndo} variant="default" title="Undo">
				<TbCornerUpLeft className="w-5 h-5" />
			</Button>
			<Button onClick={redo} size="xs" disabled={disableRedo} variant="default" title="Redo">
				<TbCornerUpRight className="w-5 h-5" />
			</Button>
		</Button.Group>
	)
}
