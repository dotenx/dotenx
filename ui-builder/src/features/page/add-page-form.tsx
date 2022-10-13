import { Button, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { z } from 'zod'
import { addPage, QueryKey } from '../../api'
import { projectTagAtom } from './top-bar'

const schema = z.object({
	pageName: z
		.string()
		.min(2)
		.max(20)
		.regex(/^[a-z0-9-]+$/i, {
			message: 'Page name can only contain lowercase letters, numbers and dashes',
		}),
})

export function AddPageForm({ onSuccess }: { onSuccess: () => void }) {
	const queryClient = useQueryClient()
	const form = useForm({ initialValues: { pageName: '' }, validate: zodResolver(schema) })
	const projectTag = useAtomValue(projectTagAtom)
	const addPageMutation = useMutation(addPage, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.Pages])
			onSuccess()
		},
	})
	const onSubmit = form.onSubmit((values) => {
		addPageMutation.mutate({
			projectTag,
			pageName: values.pageName,
			elements: [],
			dataSources: [],
			classNames: {},
			mode: 'simple',
			pageParams: [],
		})
	})

	return (
		<form onSubmit={onSubmit} className="p-1">
			<TextInput size="xs" label="Page name" {...form.getInputProps('pageName')} />
			<Button type="submit" size="xs" mt="xs" fullWidth loading={addPageMutation.isLoading}>
				Add Page
			</Button>
		</form>
	)
}
