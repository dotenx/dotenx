import { Anchor, Button, CloseButton, Divider, Text, TextInput, Tooltip } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals, openModal } from '@mantine/modals'
import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { TbCheck, TbDeviceFloppy, TbPlus, TbSettings, TbTrash, TbWorldUpload } from 'react-icons/tb'
import { useMatch } from 'react-router-dom'
import { deletePage, publishPage, QueryKey, updatePage } from '../../api'
import { useDataSourceStore } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { useClassesStore } from '../style/classes-store'
import { pageParamsAtom, projectTagAtom, selectedPageAtom } from './top-bar'

export function PageActions() {
	const isSimple = useMatch('/projects/:projectName/simple')

	return (
		<Button.Group>
			{!isSimple && <PageSettingsButton />}
			<DeleteButton />
			<SaveButton />
			<PublishButton />
		</Button.Group>
	)
}

function PageSettingsButton() {
	const selectedPage = useAtomValue(selectedPageAtom)

	return (
		<Tooltip
			withinPortal
			withArrow
			disabled={!selectedPage.exists}
			label={<Text size="xs">Settings</Text>}
		>
			<Button
				onClick={() =>
					openModal({
						title: 'Page Settings',
						children: <PageSettings />,
					})
				}
				size="xs"
				disabled={!selectedPage.exists}
				variant="default"
			>
				<TbSettings className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function PageSettings() {
	return (
		<div>
			<Divider label="URL params" mb="xl" />
			<QueryParamsForm />
			<Divider label="Persisted states" my="xl" />
			<PersistedStatesForm />
		</div>
	)
}

function PersistedStatesForm() {
	const form = useForm<{ states: string[] }>({ initialValues: { states: [] } })
	const mutation = useMutation(async (values: { states: string[] }) => values)

	return (
		<form className="space-y-6" onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
			<div className="space-y-4">
				{form.values.states.map((_, index) => (
					<div key={index} className="flex items-center gap-2">
						<TextInput {...form.getInputProps(`states.${index}`)} className="w-full" />
						<CloseButton onClick={() => form.removeListItem('states', index)} />
					</div>
				))}
			</div>
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
	const selectedPage = useAtomValue(selectedPageAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.PageDetails])
			closeAllModals()
		},
	})

	return (
		<form
			className="space-y-6"
			onSubmit={form.onSubmit((values) =>
				savePageMutation.mutate({
					projectTag,
					pageName: selectedPage.route,
					elements,
					dataSources,
					classNames: classes,
					pageParams: values.params,
					mode: 'advanced',
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

function DeleteButton() {
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
	const resetElements = useElementsStore((store) => store.reset)
	const deletePageMutation = useMutation(deletePage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			resetElements()
		},
	})
	const remove = () => deletePageMutation.mutate({ projectTag, pageName: selectedPage.route })

	return (
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
				disabled={!selectedPage.exists}
				variant="default"
			>
				<TbTrash className="text-sm" />
			</Button>
		</Tooltip>
	)
}

function SaveButton() {
	const isSimple = useMatch('/projects/:projectName/simple')
	const projectTag = useAtomValue(projectTagAtom)
	const [selectedPage, setSelectedPage] = useAtom(selectedPageAtom)
	const elements = useElementsStore((store) => store.elements)
	const dataSources = useDataSourceStore((store) => store.sources)
	const classNames = useClassesStore((store) => store.classes)
	const pageParams = useAtomValue(pageParamsAtom)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => setSelectedPage({ exists: true, route: selectedPage.route }),
	})
	const save = () => {
		savePageMutation.mutate({
			projectTag,
			pageName: selectedPage.route,
			elements,
			dataSources,
			classNames,
			mode: isSimple ? 'simple' : 'advanced',
			pageParams,
		})
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
	const projectTag = useAtomValue(projectTagAtom)
	const selectedPage = useAtomValue(selectedPageAtom)
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
	const publish = () => publishPageMutation.mutate({ projectTag, pageName: selectedPage.route })

	return (
		<Tooltip
			disabled={!selectedPage.exists}
			withinPortal
			withArrow
			label={<Text size="xs">Publish Page</Text>}
		>
			<Button
				onClick={publish}
				loading={publishPageMutation.isLoading}
				size="xs"
				disabled={!selectedPage.exists}
			>
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
