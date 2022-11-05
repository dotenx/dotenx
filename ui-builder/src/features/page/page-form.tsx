import { Button, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { addPage } from '../../api'
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

export function PageForm() {
	const projectTag = useAtomValue(projectTagAtom)
	const { projectName } = useParams()
	const navigate = useNavigate()
	const form = useForm({ initialValues: { pageName: '' }, validate: zodResolver(schema) })
	const addPageMutation = useMutation(addPage)
	const onSubmit = form.onSubmit((values) => {
		addPageMutation.mutate(
			{
				projectTag,
				pageName: values.pageName,
				elements: [],
				dataSources: [],
				classNames: {},
				mode: 'simple',
				pageParams: [],
				globals: [],
			},
			{ onSuccess: () => navigate(`/projects/${projectName}/${values.pageName}`) }
		)
	})

	return (
		<form onSubmit={onSubmit}>
			<TextInput label="Page name" {...form.getInputProps('pageName')} />
			<Button type="submit" mt="sm" fullWidth loading={addPageMutation.isLoading}>
				Add Page
			</Button>
		</form>
	)
}
