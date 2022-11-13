import { Button, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtom, useAtomValue } from 'jotai'
import { AddPageRequest, QueryKey, updatePage } from '../../api'
import { useDataSourceStore } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { globalStatesAtom } from '../page/actions'
import { pageParamsAtom, projectTagAtom } from '../page/top-bar'
import { useClassesStore } from './classes-store'
import { fontsAtom } from './typography-editor'

function useUpdatePage({ pageName }: { pageName: string }, options?: { onSuccess: () => void }) {
	const queryClient = useQueryClient()
	const projectTag = useAtomValue(projectTagAtom)
	const elements = useElementsStore((state) => state.elements)
	const dataSources = useDataSourceStore((state) => state.sources)
	const classes = useClassesStore((state) => state.classes)
	const globals = useAtomValue(globalStatesAtom)
	const savePageMutation = useMutation(updatePage, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.PageDetails]),
	})
	const pageParams = useAtomValue(pageParamsAtom)
	const fonts = useAtomValue(fontsAtom)
	const update = (values: Partial<AddPageRequest>) => {
		savePageMutation.mutate(
			{
				projectTag,
				pageName,
				elements,
				dataSources,
				classNames: classes,
				pageParams,
				mode: 'advanced',
				globals,
				fonts,
				...values,
			},
			options
		)
	}
	return { update, loading: savePageMutation.isLoading }
}

export function FontForm({ fontName, pageName }: { fontName: string; pageName: string }) {
	const [fonts, setFonts] = useAtom(fontsAtom)
	const form = useForm({ initialValues: { url: '' } })
	const { update, loading } = useUpdatePage(
		{ pageName },
		{
			onSuccess: () => {
				setFonts((fonts) => ({ ...fonts, [fontName]: form.values.url }))
				closeAllModals()
			},
		}
	)

	return (
		<form
			onSubmit={form.onSubmit((values) => {
				update({ fonts: { ...fonts, [fontName]: values.url } })
			})}
		>
			<TextInput label="Font URL" {...form.getInputProps('url')} />
			<Button mt="xl" type="submit" loading={loading} fullWidth>
				Add
			</Button>
		</form>
	)
}
