import { Button, Text, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { AnyJson, findPropertyPaths, useDataSourceStore } from './data-source-store'
import { usePageStates } from './page-states'

const schema = z.object({
	stateName: z.string().min(1),
	url: z.string().url(),
})

export function DataSourceForm() {
	const setPageState = usePageStates((store) => store.setState)
	const addSource = useDataSourceStore((store) => store.add)
	const mutation = useMutation((url: string) => axios.get<AnyJson>(url))
	const form = useForm({
		validate: zodResolver(schema),
		initialValues: { stateName: '', url: '' },
	})
	const handleSubmit = form.onSubmit((values) => {
		mutation.mutate(values.url, {
			onSuccess: (data) => {
				const response = data.data
				addSource({
					...values,
					id: nanoid(),
					properties: findPropertyPaths(response),
				})
				setPageState(values.stateName, response)
				closeAllModals()
			},
		})
	})

	return (
		<form onSubmit={handleSubmit}>
			<TextInput label="State name" {...form.getInputProps('stateName')} />
			<Text size="xs" color="dimmed">
				Unique state name for this data
			</Text>
			<TextInput mt="xs" label="URL" {...form.getInputProps('url')} />
			<Text size="xs" color="dimmed">
				JSON API endpoint to fetch data from (be sure it is CORS enabled)
			</Text>
			<Button fullWidth mt="xl" type="submit" loading={mutation.isLoading}>
				Add
			</Button>
		</form>
	)
}
