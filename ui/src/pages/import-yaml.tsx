import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createAutomationYaml } from '../api'
import { Button } from '../features/ui'

export default function ImportYamlPage() {
	const navigate = useNavigate()
	const { handleSubmit, register } = useForm({ defaultValues: { code: '' } })
	const { mutate } = useMutation(createAutomationYaml)

	return (
		<div className="grow">
			<div className="flex flex-col h-full gap-10 px-32 py-16">
				<h3 className="text-2xl font-bold">Import YAML</h3>
				<form
					className="flex flex-col gap-6 grow"
					onSubmit={handleSubmit((values) => mutate(values.code))}
				>
					<textarea
						className="w-full px-2 py-1 overflow-y-auto font-mono rounded-md outline-none resize-none grow bg-slate-50"
						{...register('code')}
					/>
					<Button type="submit" className="self-end w-48">
						Import and Save
					</Button>
				</form>
			</div>
		</div>
	)
}
