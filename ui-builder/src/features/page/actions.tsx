import {
	Button,
	CloseButton,
	Collapse,
	Divider,
	Loader,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useClickOutside, useClipboard } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { FaCheck, FaCopy, FaExternalLinkAlt, FaPlay } from 'react-icons/fa'
import { IoSaveOutline } from 'react-icons/io5'
import { TbCode, TbPlus, TbSettings, TbTrash, TbWorldUpload } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import {
	changeGlobalStates,
	deletePage,
	getGlobalStates,
	getPageURls,
	GlobalStates,
	previewPage,
	publishPage,
	QueryKey,
	updatePage,
} from '../../api'
import { animationsAtom } from '../atoms'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { statesDefaultValuesAtom } from '../states/default-values-form'
import { useClassesStore } from '../style/classes-store'
import { fontsAtom } from '../style/typography-editor'
import { CustomCode } from './custom-code'
import { pageModeAtom, pageParamsAtom, projectTagAtom } from './top-bar'

export const globalStatesAtom = atom<string[]>([])
export const customCodesAtom = atom<{ head: string; footer: string }>({ head: '', footer: '' })

export function PageActions() {
	const mode = useAtomValue(pageModeAtom)
	const projectTag = useAtomValue(projectTagAtom)
	const { pageName = 'index' } = useParams()

	const isSimple = mode === 'simple'
	const { data: pageUrls, isLoading } = useQuery([QueryKey.GetPageUrls, pageName], () =>
		getPageURls({ projectTag, pageName })
	)
	return (
		<Button.Group>
			{!isSimple && <PageSettingsButton />}
			<DeletePageButton />
			<SaveButton />
			<PreviewButton url={pageUrls?.data.preview_url.url || ''} isLoading={isLoading} />
			<PublishButton url={pageUrls?.data.publish_url.url || ''} isLoading={isLoading} />
		</Button.Group>
	)
}

function PageSettingsButton() {
	const { projectName = '', pageName = '' } = useParams()

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Settings</Text>}>
			<Button
				onClick={() =>
					openModal({
						title: 'Page Settings',
						children: <PageSettings projectName={projectName} pageName={pageName} />,
					})
				}
				size="xs"
				variant="default"
			>
				<TbSettings className="w-5 h-5" />
			</Button>
		</Tooltip>
	)
}

function PageSettings({ projectName, pageName }: { projectName: string; pageName: string }) {
	const [customCodes, setCustomCodes] = useAtom(customCodesAtom)

	return (
		<div>
			<Divider label="Custom code" mb="xl" />
			<div className="flex gap-2">
				<Button
					fullWidth
					leftIcon={<TbCode />}
					onClick={() =>
						openModal({
							title: 'Head Code',
							children: (
								<CustomCode
									defaultValue={customCodes.head}
									onSave={(value) => {
										setCustomCodes((codes) => ({ ...codes, head: value }))
										closeAllModals()
									}}
									defaultLanguage="html"
								/>
							),
							size: 'xl',
						})
					}
				>
					Head Code
				</Button>
				<Button
					fullWidth
					leftIcon={<TbCode />}
					onClick={() =>
						openModal({
							title: 'Head Code',
							children: (
								<CustomCode
									defaultValue={customCodes.footer}
									onSave={(value) => {
										setCustomCodes((codes) => ({ ...codes, footer: value }))
										closeAllModals()
									}}
									defaultLanguage="javascript"
								/>
							),
							size: 'xl',
						})
					}
				>
					Footer Code
				</Button>
			</div>
			<Divider label="URL params" my="xl" />
			<QueryParamsForm pageName={pageName} />
			<Divider label="Persisted states" my="xl" />
			<PersistedStatesForm projectName={projectName} />
		</div>
	)
}

function PersistedStatesForm({ projectName }: { projectName: string }) {
	const globalStates = useAtomValue(globalStatesAtom)
	const form = useForm<GlobalStates>({ initialValues: { states: globalStates } })
	const globalStatesQuery = useQuery(
		[QueryKey.GlobalStates, projectName],
		() => getGlobalStates({ projectName }),
		{
			enabled: !!projectName,
			onSuccess: (data) => {
				form.setValues(data.data)
			},
		}
	)
	const queryClient = useQueryClient()
	const mutation = useMutation(changeGlobalStates, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.GlobalStates]),
	})
	const onSubmit = form.onSubmit((values) => mutation.mutate({ projectName, payload: values }))
	const fields = form.values.states.map((_, index) => (
		<div key={index} className="flex items-center gap-2">
			<TextInput {...form.getInputProps(`states.${index}`)} className="w-full" />
			<CloseButton onClick={() => form.removeListItem('states', index)} />
		</div>
	))

	if (globalStatesQuery.isLoading) return <Loader mx="auto" size="xs" />

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<div className="space-y-4">{fields}</div>
			<Button
				leftIcon={<TbPlus />}
				variant="outline"
				onClick={() => form.insertListItem('states', '')}
			>
				State
			</Button>
			<Button fullWidth type="submit" loading={mutation.isLoading}>
				Save
			</Button>
		</form>
	)
}

function QueryParamsForm({ pageName }: { pageName: string }) {
	const setSaved = useElementsStore((store) => store.save)
	const pageParams = useAtomValue(pageParamsAtom)
	const form = useForm<{ params: string[] }>({ initialValues: { params: pageParams ?? [] } })
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const globals = useAtomValue(globalStatesAtom)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.PageDetails])
			setSaved()
		},
	})
	const fonts = useAtomValue(fontsAtom)
	const customCodes = useAtomValue(customCodesAtom)
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const animations = useAtomValue(animationsAtom)

	return (
		<form
			className="space-y-6"
			onSubmit={form.onSubmit((values) =>
				savePageMutation.mutate({
					projectTag,
					pageName,
					elements,
					dataSources,
					classNames: classes,
					pageParams: values.params,
					mode: 'advanced',
					globals,
					fonts,
					customCodes,
					statesDefaultValues,
					animations,
				})
			)}
		>
			<div className="space-y-4">
				{form.values.params.map((_, index) => (
					<div key={index} className="flex items-center gap-2">
						<TextInput {...form.getInputProps(`params.${index}`)} className="w-full" />
						<CloseButton onClick={() => form.removeListItem('params', index)} />
					</div>
				))}
			</div>
			<Button
				leftIcon={<TbPlus />}
				variant="outline"
				onClick={() => form.insertListItem('params', '')}
			>
				Param
			</Button>
			<Button fullWidth type="submit" loading={savePageMutation.isLoading}>
				Save
			</Button>
		</form>
	)
}

function DeletePageButton() {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const resetElements = useElementsStore((store) => store.reset)
	const { projectName, pageName = '' } = useParams()
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			navigate(`/projects/${projectName}`)
			queryClient.invalidateQueries([QueryKey.Pages])
			resetElements()
		},
	})
	const remove = () => deletePageMutation.mutate({ projectTag, pageName })

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Delete Page</Text>}>
			<Button
				onClick={remove}
				loading={deletePageMutation.isLoading}
				size="xs"
				variant="default"
				disabled={pageName === 'index'}
			>
				<TbTrash className="w-5 h-5" />
			</Button>
		</Tooltip>
	)
}

function SaveButton() {
	const setSaved = useElementsStore((store) => store.save)
	const { pageName = '' } = useParams()
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const projectTag = useAtomValue(projectTagAtom)
	const setPageMode = useSetAtom(pageModeAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const pageParams = useAtomValue(pageParamsAtom)
	const globals = useAtomValue(globalStatesAtom)
	const fonts = useAtomValue(fontsAtom)
	const savePageMutation = useMutation(updatePage)
	const customCodes = useAtomValue(customCodesAtom)
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const animations = useAtomValue(animationsAtom)

	const save = () => {
		savePageMutation.mutate(
			{
				projectTag,
				pageName,
				elements,
				dataSources,
				classNames,
				mode: isSimple ? 'simple' : 'advanced',
				pageParams,
				globals,
				fonts,
				customCodes,
				statesDefaultValues,
				animations,
			},
			{
				onSuccess: () => {
					setPageMode(isSimple ? 'simple' : 'advanced')
					setSaved()
				},
			}
		)
	}

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Save Page</Text>}>
			<Button onClick={save} loading={savePageMutation.isLoading} size="xs" variant="default">
				<IoSaveOutline className="w-5 h-5" />
			</Button>
		</Tooltip>
	)
}

function PreviewButton({ url, isLoading }: { url: string; isLoading: boolean }) {
	const { pageName = 'index' } = useParams()

	const projectTag = useAtomValue(projectTagAtom)
	const [previewUrl, setPreviewUrl] = useState('')

	useEffect(() => {
		setPreviewUrl(url as string)
	}, [isLoading])

	const previewPageMutation = useMutation(previewPage, {
		onSuccess: (data) => {
			setPreviewUrl(data.data.url)
		},
	})
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const setPageMode = useSetAtom(pageModeAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const pageParams = useAtomValue(pageParamsAtom)
	const globals = useAtomValue(globalStatesAtom)
	const fonts = useAtomValue(fontsAtom)
	const savePageMutation = useMutation(updatePage)
	const setSaved = useElementsStore((store) => store.save)
	const customCodes = useAtomValue(customCodesAtom)
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const animations = useAtomValue(animationsAtom)

	const [open, setOpen] = useState(false)

	const handleGetPreview = () => {
		savePageMutation.mutate(
			{
				projectTag,
				pageName,
				elements,
				dataSources,
				classNames,
				mode: isSimple ? 'simple' : 'advanced',
				pageParams,
				globals,
				fonts,
				customCodes,
				statesDefaultValues,
				animations,
			},
			{
				onSuccess: () => {
					previewPageMutation.mutate({ projectTag, pageName })
					setPageMode(isSimple ? 'simple' : 'advanced')
					setSaved()
				},
			}
		)
	}
	const outsideClickRef = useClickOutside(() => setOpen(false))
	const copyPreview = useClipboard({ timeout: 1000 })

	return (
		<div className="cursor-default" ref={outsideClickRef}>
			<Tooltip withinPortal openDelay={1000} withArrow label={<Text size="xs">Preview</Text>}>
				<Button
					onClick={() => {
						setOpen(!open)
					}}
					disabled={isLoading}
					variant="light"
					size="xs"
				>
					<FaPlay className="w-4 h-4 " />
				</Button>
			</Tooltip>
			{open && (
				<Collapse in={open}>
					<div className=" text-slate-900 w-[300px] shadow-md outline-1 absolute top-12 right-16 p-5 flex-col items-center justify-center rounded-md  bg-slate-50 h-auto">
						<div className="mb-4 text-sm font-semibold ">
							Publish your temporary preview that you can share with others
						</div>
						{previewUrl && (
							<div>
								Preview url:
								<div className="flex items-center rounded-md cursor-pointer w-fit text-slate-50 text-md bg-rose-600">
									<div className="  p-2 w-[190px] rounded-l-md text-xs h-10 flex items-center truncate  cursor-text">
										<span className="w-[170px]"> {previewUrl}</span>
									</div>
									<div
										onClick={() => copyPreview.copy(previewUrl)}
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 border-x-2 border-rose-700"
									>
										{copyPreview.copied ? (
											<FaCheck className="w-5 h-5 mb-1 " />
										) : (
											<FaCopy className="w-5 h-5 mb-1 " />
										)}
									</div>
									<a
										href={previewUrl}
										target={'_blank'}
										rel="noopener noreferrer"
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 rounded-r-md"
									>
										<FaExternalLinkAlt className="w-5 h-5 mb-1 " />
									</a>
								</div>
							</div>
						)}

						<Button
							className="!rounded-md !w-[270px] mt-6"
							variant={'light'}
							onClick={handleGetPreview}
							disabled={savePageMutation.isLoading}
							loading={previewPageMutation.isLoading}
						>
							Generate Preview link
						</Button>
					</div>
				</Collapse>
			)}
		</div>
	)
}
function PublishButton({ url, isLoading }: { url: string; isLoading: boolean }) {
	const { pageName = 'index', projectName } = useParams()
	const projectTag = useAtomValue(projectTagAtom)
	const [publishUrl, setPublishUrl] = useState('')

	useEffect(() => {
		setPublishUrl(url as string)
	}, [isLoading])

	const publishPageMutation = useMutation(publishPage)

	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const setPageMode = useSetAtom(pageModeAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const pageParams = useAtomValue(pageParamsAtom)
	const globals = useAtomValue(globalStatesAtom)
	const fonts = useAtomValue(fontsAtom)
	const savePageMutation = useMutation(updatePage)
	const setSaved = useElementsStore((store) => store.save)
	const customCodes = useAtomValue(customCodesAtom)
	const statesDefaultValues = useAtomValue(statesDefaultValuesAtom)
	const animations = useAtomValue(animationsAtom)
	const publish = () =>
		publishPageMutation.mutate(
			{ projectTag, pageName },
			{
				onSuccess: (data) => {
					setPublishUrl(data.data.url)
					setSaved()
				},
			}
		)
	const [open, setOpen] = useState(false)
	const save = () => {
		savePageMutation.mutate(
			{
				projectTag,
				pageName,
				elements,
				dataSources,
				classNames,
				mode: isSimple ? 'simple' : 'advanced',
				pageParams,
				globals,
				fonts,
				customCodes,
				statesDefaultValues,
				animations,
			},
			{
				onSuccess: () => {
					publish(), setPageMode(isSimple ? 'simple' : 'advanced')
				},
			}
		)
	}

	const outsideClickRef = useClickOutside(() => setOpen(false))
	const copyPublish = useClipboard({ timeout: 1000 })

	return (
		<div className="cursor-default" ref={outsideClickRef}>
			<Tooltip
				withinPortal
				openDelay={1000}
				withArrow
				label={<Text size="xs">Publish Page</Text>}
			>
				<Button
					onClick={() => {
						setOpen(!open)
					}}
					disabled={isLoading}
					size="xs"
				>
					<TbWorldUpload className="w-5 h-5 " />
				</Button>
			</Tooltip>
			{open && (
				<Collapse in={open}>
					<div className=" text-slate-900 w-[300px] shadow-md outline-1 absolute top-12 right-16 p-5 flex-col items-center justify-center rounded-md  bg-slate-50 h-auto">
						<div className="font-semibold text-md ">
							Publish your page to make it live
						</div>
						<div className="my-[14px]">
							<a
								className="text-indigo-300 underline "
								href={`https://app.dotenx.com/builder/projects/${projectName}/domains`}
								target={'_blank'}
								rel="noopener noreferrer"
							>
								Custom domain
							</a>
						</div>
						{publishUrl ? (
							<div>
								Page url:
								<div className="flex items-center rounded-md cursor-pointer w-fit text-slate-50 text-md bg-rose-600">
									<div className="  p-2 w-[190px] rounded-l-md text-xs h-10 flex items-center truncate  cursor-text">
										<span className="w-[170px]"> {publishUrl}</span>
									</div>
									<div
										onClick={() => copyPublish.copy(publishUrl)}
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 border-x-2 border-rose-700"
									>
										{copyPublish.copied ? (
											<FaCheck className="w-5 h-5 mb-1 " />
										) : (
											<FaCopy className="w-5 h-5 mb-1 " />
										)}
									</div>
									<a
										href={publishUrl}
										target={'_blank'}
										rel="noopener noreferrer"
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 rounded-r-md"
									>
										<FaExternalLinkAlt className="w-5 h-5 mb-1 " />
									</a>
								</div>
							</div>
						) : (
							<div className="flex items-center h-3">
								Your page is not published yet.
							</div>
						)}

						<Button
							onClick={save}
							disabled={savePageMutation.isLoading}
							loading={publishPageMutation.isLoading}
							className={'!rounded-md  !w-[270px] mt-4'}
							size="md"
						>
							Save & Publish
						</Button>
					</div>
				</Collapse>
			)}
		</div>
	)
}
