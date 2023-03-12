import {
	Button,
	CloseButton,
	Collapse,
	Divider,
	Loader,
	Modal,
	Text,
	TextInput,
	Tooltip
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useClickOutside, useClipboard } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useState } from 'react'
import { IoSaveOutline } from 'react-icons/io5'
import {
	TbCheck,
	TbCode,
	TbCopy,
	TbExternalLink,
	TbPlayerPlay,
	TbPlus,
	TbSettings,
	TbTrash,
	TbWorldUpload
} from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import {
	changeGlobalStates,
	deletePage,
	getGlobalStates,
	getPageUrls,
	GlobalStates,
	previewPage,
	publishPage,
	QueryKey
} from '../../api'
import { useElementsStore } from '../elements/elements-store'
import { CustomCode } from './custom-code'
import {
	pageModeAtom,
	pageParamsAtom,
	projectTagAtom,
	projectTypeAtom,
	useHasUnsavedChanges
} from './top-bar'
import { usePageData, useResetPage, useUpdatePage } from './use-update'

export const globalStatesAtom = atom<string[]>([])
export const customCodesAtom = atom<{ head: string; footer: string }>({ head: '', footer: '' })

export function PageActions({
	showSettings = true,
	settings,
}: {
	showSettings?: boolean
	settings?: ReactNode
}) {
	const mode = useAtomValue(pageModeAtom)
	const projectTag = useAtomValue(projectTagAtom)
	const { pageName = 'index' } = useParams()
	const isSimple = mode === 'simple'
	const { data: pageUrls, isLoading } = useQuery(
		[QueryKey.GetPageUrls, pageName],
		() => getPageUrls({ projectTag, pageName }),
		{ enabled: !!projectTag && !!pageName }
	)

	return (
		<Button.Group>
			{!isSimple && showSettings && !settings && <PageSettingsButton />}
			{settings}
			<DuplicatePageButton />
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
			<QueryParamsForm />
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

function QueryParamsForm() {
	const setSaved = useElementsStore((store) => store.save)
	const pageParams = useAtomValue(pageParamsAtom)
	const form = useForm<{ params: string[] }>({ initialValues: { params: pageParams ?? [] } })
	const queryClient = useQueryClient()
	const updatePageMutation = useUpdatePage()
	const pageData = usePageData()

	return (
		<form
			className="space-y-6"
			onSubmit={form.onSubmit((values) =>
				updatePageMutation.mutate(
					{
						...pageData,
						pageParams: values.params,
					},
					{
						onSuccess: () => {
							queryClient.invalidateQueries([QueryKey.PageDetails])
							setSaved()
						},
					}
				)
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
			<Button fullWidth type="submit" loading={updatePageMutation.isLoading}>
				Save
			</Button>
		</form>
	)
}

export function DuplicatePageButton() {
	const { projectName = '' } = useParams()
	const navigate = useNavigate()

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Duplicate Page</Text>}>
			<Button
				size="xs"
				variant="default"
				onClick={() => {
					openModal({
						title: 'Duplicate Page',
						children: (
							<DuplicatePageForm
								onSuccess={(pageName) =>
									navigate(`/projects/${projectName}/${pageName}`)
								}
							/>
						),
					})
				}}
			>
				<TbCopy className="w-5 h-5" />
			</Button>
		</Tooltip>
	)
}

function DuplicatePageForm({ onSuccess }: { onSuccess: (pageName: string) => void }) {
	const setSaved = useElementsStore((store) => store.save)
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const setPageMode = useSetAtom(pageModeAtom)
	const queryClient = useQueryClient()
	const schema = z.object({
		name: z.string().min(1),
	})
	const form = useForm<z.infer<typeof schema>>({
		validate: zodResolver(schema),
		initialValues: {
			name: '',
		},
	})
	const updatePageMutation = useUpdatePage()
	const pageData = usePageData()

	const onSubmit = form.onSubmit((value) => {
		updatePageMutation.mutate(pageData, {
			onSuccess: () => {
				queryClient.invalidateQueries([QueryKey.Pages])
				setPageMode(isSimple ? 'simple' : 'advanced')
				setSaved()
				closeAllModals()
				onSuccess(value.name)
			},
		})
	})

	return (
		<form onSubmit={onSubmit}>
			<TextInput label="Page name" {...form.getInputProps('name')} />
			<Button mt="xl" fullWidth type="submit" loading={updatePageMutation.isLoading}>
				Duplicate page
			</Button>
		</form>
	)
}

export function DeletePageButton() {
	const [opened, setOpened] = useState(false)

	return (
		<>
			<DeletePageModal opened={opened} setOpened={setOpened} />
			<Tooltip withinPortal withArrow label={<Text size="xs">Delete Page</Text>}>
				<Button onClick={() => setOpened(true)} size="xs" variant="default">
					<TbTrash className="w-5 h-5" />
				</Button>
			</Tooltip>
		</>
	)
}

function DeletePageModal({
	opened,
	setOpened,
}: {
	opened: boolean
	setOpened: (value: boolean) => void
}) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const resetElements = useElementsStore((store) => store.reset)
	const { projectName, pageName = '' } = useParams()
	const projectType = useAtomValue(projectTypeAtom)
	const resetMutation = useResetPage()

	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			navigate(
				projectType === 'ecommerce'
					? `/ecommerce/${projectName}/index`
					: `/projects/${projectName}`
			)
			queryClient.invalidateQueries([QueryKey.Pages])
			resetElements()
		},
	})

	const remove = () =>
		deletePageMutation.mutate({ projectTag, pageName }, { onSuccess: () => setOpened(false) })

	return (
		<Modal opened={opened} onClose={() => setOpened(false)} title="CAUTION!">
			<div className="flex flex-col items-center justify-center space-y-4">
				<Text size="sm" weight="medium">
					Are you sure you want to{' '}
					<Text weight="bold" className="inline">
						DELETE
					</Text>{' '}
					this page?
				</Text>
				<div className="flex space-x-4">
					<Button variant="default" onClick={() => setOpened(false)}>
						Cancel
					</Button>
					<Button
						variant="filled"
						color={'red'}
						loading={resetMutation.isLoading || deletePageMutation.isLoading}
						onClick={() => {
							if (pageName === 'index')
								resetMutation.mutate(undefined, {
									onSuccess: () => setOpened(false),
								})
							else remove()
						}}
					>
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export function SaveButton() {
	const unsaved = useHasUnsavedChanges()
	const pageData = usePageData()
	const updatePage = useUpdatePage()

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Save Page</Text>}>
			<Button
				onClick={() => updatePage.mutate(pageData)}
				disabled={!unsaved}
				loading={updatePage.isLoading}
				size="xs"
				variant="default"
				radius={0}
			>
				<IoSaveOutline className="w-5 h-5" />
			</Button>
		</Tooltip>
	)
}

export function PreviewButton({ url, isLoading }: { url: string; isLoading: boolean }) {
	const { pageName = 'index' } = useParams()
	const outsideClickRef = useClickOutside(() => setOpen(false))
	const copyPreview = useClipboard({ timeout: 1000 })
	const projectTag = useAtomValue(projectTagAtom)
	const [previewUrl, setPreviewUrl] = useState('')
	const previewPageMutation = useMutation(previewPage, {
		onSuccess: (data) => {
			setPreviewUrl(data.data.url)
		},
	})
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const setPageMode = useSetAtom(pageModeAtom)
	const setSaved = useElementsStore((store) => store.save)
	const updatePageMutation = useUpdatePage()
	const pageData = usePageData()
	const [open, setOpen] = useState(false)

	const handleGetPreview = () => {
		updatePageMutation.mutate(pageData, {
			onSuccess: () => {
				previewPageMutation.mutate({ projectTag, pageName })
				setPageMode(isSimple ? 'simple' : 'advanced')
				setSaved()
			},
		})
	}

	useEffect(() => {
		setPreviewUrl(url as string)
	}, [isLoading, url])

	return (
		<div className="cursor-default" ref={outsideClickRef}>
			<Tooltip withinPortal withArrow label={<Text size="xs">Preview</Text>}>
				<Button
					onClick={() => setOpen(!open)}
					disabled={isLoading}
					variant="light"
					size="xs"
				>
					<TbPlayerPlay className="w-4 h-4 " />
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
											<TbCheck className="w-5 h-5 mb-1 " />
										) : (
											<TbCopy className="w-5 h-5 mb-1 " />
										)}
									</div>
									<a
										href={previewUrl}
										target={'_blank'}
										rel="noopener noreferrer"
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 rounded-r-md"
									>
										<TbExternalLink className="w-5 h-5 mb-1 " />
									</a>
								</div>
							</div>
						)}

						<Button
							className="!rounded-md !w-[270px] mt-6"
							variant={'light'}
							onClick={handleGetPreview}
							disabled={updatePageMutation.isLoading}
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

export function PublishButton({ url, isLoading }: { url: string; isLoading: boolean }) {
	const { pageName = 'index', projectName } = useParams()
	const projectTag = useAtomValue(projectTagAtom)
	const [publishUrl, setPublishUrl] = useState('')
	const publishPageMutation = useMutation(publishPage)
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'
	const setPageMode = useSetAtom(pageModeAtom)
	const setSaved = useElementsStore((store) => store.save)
	const [open, setOpen] = useState(false)
	const updatePageMutation = useUpdatePage()
	const pageData = usePageData()

	useEffect(() => {
		setPublishUrl(url as string)
	}, [isLoading, url])

	const publish = () =>
		publishPageMutation.mutate(
			{ projectTag, pageName },
			{
				onSuccess: (data) => {
					setPublishUrl(data.data.url)
					setSaved()
					notifications.show({
						title: 'Page published successfully',
						message: 'Your page is now live',
						color: 'green',
					})
				},
			}
		)

	const save = () => {
		updatePageMutation.mutate(pageData, {
			onSuccess: () => {
				publish()
				setPageMode(isSimple ? 'simple' : 'advanced')
			},
		})
	}

	const outsideClickRef = useClickOutside(() => setOpen(false))
	const copyPublish = useClipboard({ timeout: 1000 })

	return (
		<div className="cursor-default" ref={outsideClickRef}>
			<Tooltip withinPortal withArrow label={<Text size="xs">Publish Page</Text>}>
				<Button
					onClick={() => {
						setOpen(!open)
					}}
					disabled={isLoading}
					className="!rounded-r"
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
											<TbCheck className="w-5 h-5 mb-1 " />
										) : (
											<TbCopy className="w-5 h-5 mb-1 " />
										)}
									</div>
									<a
										href={publishUrl}
										target={'_blank'}
										rel="noopener noreferrer"
										className="p-2 transition active:bg-rose-800 hover:text-white hover:bg-rose-700 rounded-r-md"
									>
										<TbExternalLink className="w-5 h-5 mb-1 " />
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
							loading={publishPageMutation.isLoading || updatePageMutation.isLoading}
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
