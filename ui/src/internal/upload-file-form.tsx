import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mantine/core'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { QueryKey, uploadFile } from '../api'
import { useModal } from '../features/hooks'
import { Form, Select } from '../features/ui'

const schema = z.object({
	file: z.any(),
	access: z.string(),
})

type Schema = z.infer<typeof schema>

export function UploadFileForm({ tag }: { tag: string }) {
	const [file, setFile] = useState<File>()

	const client = useQueryClient()
	const modal = useModal()
	const form = useForm<Schema>({
		defaultValues: { file: undefined, access: '' },
		resolver: zodResolver(schema),
	})
	const mutation = useMutation(
		(payload: { access: string }) => {
			const formData = new FormData()
			formData.append('file', file ? file : '')
			formData.append('access', payload.access)
			return uploadFile(tag, formData)
		},
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetFiles)
				modal.close()
			},
		}
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
	const options = [
		{ label: 'Public', value: 'public' },
		{ label: 'Owner', value: 'owner' },
		{ label: 'Private', value: 'private' },
	]
	return (
		<Form className="gap-16" onSubmit={onSubmit}>
			<Select
				label="Access"
				name="access"
				control={form.control}
				options={options}
				errors={form.formState.errors}
			/>
			<div className="grid grid-cols-2">
				<div className="flex flex-col gap-1 ">
					<span className="text-sm font-medium">Choose file: </span>
					<label
						htmlFor="file"
						className="flex items-center text-white w-1/2 justify-center  font-bold px-2 bg-rose-500 transition-colors hover:bg-rose-600 cursor-pointer py-1  rounded-lg   form-input "
					>
						<span className="mr-2">browse</span>
						<BsFillFolderSymlinkFill />
					</label>
					<input
						name="file"
						id="file"
						className="hidden shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						type="file"
						required
						onChange={(e) => {
							setFile(e.target.files?.[0])
						}}
						value={undefined}
					/>
				</div>
				{file && (
					<div className="border pl-2 p-1 rounded">
						<span className="font-medium">file name: </span>
						<span className="truncate">{file?.name}</span>
						<br /> <span className="font-medium">file size: </span>
						{Math.floor(file?.size / 1000) + 'kb'}
					</div>
				)}
			</div>

			<Button loading={mutation.isLoading} type="submit">
				Upload
			</Button>
		</Form>
	)
}
