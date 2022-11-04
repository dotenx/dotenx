import {
	Anchor,
	Button,
	CloseButton,
	Divider,
	Loader,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { openModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { TbCheck, TbDeviceFloppy, TbPlus, TbSettings, TbTrash, TbWorldUpload } from 'react-icons/tb'
import { useNavigate, useParams } from 'react-router-dom'
import {
	changeGlobalStates,
	deletePage,
	getGlobalStates,
	GlobalStates,
	publishPage,
	QueryKey,
	updatePage,
} from '../../api'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useClassesStore } from '../style/classes-store'
import { pageModeAtom, pageParamsAtom, projectTagAtom } from './top-bar'

export const globalStatesAtom = atom<string[]>([])

export function PageActions() {
	const mode = useAtomValue(pageModeAtom)
	const isSimple = mode === 'simple'

	return (
		<Button.Group>
			{!isSimple && <PageSettingsButton />}
			<DeletePageButton />
			<SaveButton />
			<PublishButton />
		</Button.Group>
	)
}

function PageSettingsButton() {
	const { projectName = '' } = useParams()

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Settings</Text>}>
			<Button
				onClick={() =>
					openModal({
						title: 'Page Settings',
						children: <PageSettings projectName={projectName} />,
					})
				}
				size="xs"
				variant="default"
			>
				<TbSettings className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function PageSettings({ projectName }: { projectName: string }) {
	return (
		<div>
			<Divider label="URL params" mb="xl" />
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
	const pageParams = useAtomValue(pageParamsAtom)
	const form = useForm<{ params: string[] }>({ initialValues: { params: pageParams ?? [] } })
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const globals = useAtomValue(globalStatesAtom)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const { pageName = '' } = useParams()

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
	const { projectName } = useParams()
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			navigate(`/projects/${projectName}`)
			queryClient.invalidateQueries([QueryKey.Pages])
			resetElements()
		},
	})
	const { pageName = '' } = useParams()
	const remove = () => deletePageMutation.mutate({ projectTag, pageName })

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Delete Page</Text>}>
			<Button
				onClick={remove}
				loading={deletePageMutation.isLoading}
				size="xs"
				variant="default"
			>
				<TbTrash className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function SaveButton() {
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
	const savePageMutation = useMutation(updatePage)
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
			},
			{ onSuccess: () => setPageMode(isSimple ? 'simple' : 'advanced') }
		)
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
	const { pageName = '' } = useParams()
	const projectTag = useAtomValue(projectTagAtom)
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
	const publish = () => publishPageMutation.mutate({ projectTag, pageName })

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Publish Page</Text>}>
			<Button onClick={publish} loading={publishPageMutation.isLoading} size="xs">
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
