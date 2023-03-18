import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useParams } from 'react-router-dom'
import { AddPageRequest, QueryKey, updatePage } from '../../api'
import { joinAnimations, joinScripts } from '../../utils/join-scripts'
import { animationsAtom } from '../atoms'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { selectedPaletteAtom } from '../simple/palette'
import { statesDefaultValuesAtom } from '../states/default-values-form'
import { useClassesStore } from '../style/classes-store'
import { useGeneratePalette } from '../style/generate-styles'
import { fontsAtom } from '../style/typography-editor'
import { customCodesAtom, globalStatesAtom } from './actions'
import { pageModeAtom, pageParamsAtom, projectTagAtom } from './top-bar'

export const useUpdatePage = () => {
	const setSaved = useElementsStore((store) => store.save)
	const setPageMode = useSetAtom(pageModeAtom)
	const updatePageMutation = useMutation(updatePage, {
		onSuccess: (_, variables) => {
			setPageMode(variables.mode)
			setSaved()
		},
	})

	return updatePageMutation
}

export const usePageData = (): AddPageRequest => {
	const { pageName = '' } = useParams()
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const projectTag = useAtomValue(projectTagAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const pageParams = useAtomValue(pageParamsAtom)
	const globals = useAtomValue(globalStatesAtom)
	const fonts = useAtomValue(fontsAtom)
	const customCodes = useAtomValue(customCodesAtom)
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const animations = usePageAnimations()
	const palette = useAtomValue(selectedPaletteAtom)
	const paletteCss = useGeneratePalette()

	return {
		projectTag,
		pageName,
		elements,
		dataSources,
		classNames,
		mode: isSimple ? ('simple' as const) : ('advanced' as const),
		pageParams,
		globals,
		fonts,
		customCodes: {
			...customCodes,
			scripts: `<script>${joinScripts(elements)}</script>`,
			styles: `<style>
			${paletteCss}
			${additionalStyles}
			</style>`,
		},
		statesDefaultValues,
		animations,
		colorPaletteId: palette.id,
	}
}

const usePageAnimations = () => {
	const elements = useElementsStore((store) => store.elements)
	const animations = useAtomValue(animationsAtom)
	const elementAnimations = joinAnimations(elements)
	return [...animations, ...elementAnimations]
}

export const useResetPage = () => {
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const { pageName = '' } = useParams()

	const setSaved = useElementsStore((store) => store.save)
	const savePageMutation = useMutation(
		() =>
			updatePage({
				projectTag,
				pageName,
				elements: [],
				dataSources: [],
				classNames: {},
				mode: 'simple',
				pageParams: [],
				globals: [],
				fonts: {},
				customCodes: { head: '', footer: '', scripts: '', styles: '' },
				statesDefaultValues: {},
				animations: [],
				colorPaletteId: null,
			}),
		{
			onSuccess: () => {
				queryClient.invalidateQueries([QueryKey.PageDetails])
				setSaved()
			},
		}
	)

	return savePageMutation
}

const additionalStyles = `
.loader {
    width: 16px;
    height: 16px;
    border: 3px solid currentColor;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    }
    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
} 
`
