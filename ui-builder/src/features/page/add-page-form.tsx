import { Button, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMatch, useNavigate, useParams } from 'react-router-dom'
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
	const isEcommerce = useMatch('/ecommerce/:projectName/:pageName')
	const { projectName } = useParams()
	const navigate = useNavigate()
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
				fonts: {},
				customCodes: { head: '', footer: '', scripts: '', styles: '' },
				statesDefaultValues: {},
				animations: [],
				colorPaletteId: null,
			},
			{
				onSuccess: () =>
					navigate(
						`/${isEcommerce ? 'ecommerce' : 'projects'}/${projectName}/${
							values.pageName
						}`
					),
				onError: (e: any) => {
					if (e.response.status === 400) {
						showNotification({
							message: (
								<div className="space-y-5 pt-3">
									<div className="text-slate-900">
										You have reached your account’s limitation. Please upgrade
										your account to be able to add new pages.
										<span className="text-slate-500">
											You can also use referral codes to increase your
											account’s limits.
										</span>
									</div>
									<Button size="xs">
										<a
											href="https://admin.dotenx.com/plan"
											rel="noopener noreferrer"
										>
											Upgrade plan
										</a>
									</Button>
								</div>
							),
							autoClose: false,
						})
					} else {
						showNotification({
							message: e.response.data.message,
						})
					}
				},
			}
		)
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
