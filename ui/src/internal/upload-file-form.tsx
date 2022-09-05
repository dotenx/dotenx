import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Checkbox } from '@mantine/core'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { QueryKey, uploadFile } from '../api'
import { useModal } from '../features/hooks'
import { Form } from '../features/ui'

const schema = z.object({
	file: z.any(),
	isPublic: z.boolean(),
})

type Schema = z.infer<typeof schema>

export function UploadFileForm({ tag }: { tag: string }) {
	const [file, setFile] = useState<File>()
	const [isPublic, setisPublic] = useState(false)

	const client = useQueryClient()
	const modal = useModal()
	const form = useForm<Schema>({
		defaultValues: { file: undefined, isPublic: false },
		resolver: zodResolver(schema),
	})

	const mutation = useMutation(
		() => {
			const formData = new FormData()
			formData.append('file', file ? file : '')
			formData.append('is_public', JSON.stringify(isPublic))
			return uploadFile(tag, formData)
		},
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetFiles)
				modal.close()
			},
		}
	)
	const onSubmit = form.handleSubmit(() => mutation.mutate())

	return (
		<Form className="gap-16" onSubmit={onSubmit}>
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
						{(file?.size / 1000).toFixed(1) + 'kb'}
					</div>
				)}
			</div>
			<div>
				<div className="py-2 text-sm font-medium">File access</div>
				<Checkbox
					name="isPublic"
					label="Public"
					readOnly
					checked={isPublic}
					onClick={() => {
						setisPublic(!isPublic)
					}}
				/>
			</div>
			<Button loading={mutation.isLoading} type="submit">
				Upload
			</Button>
		</Form>
	)
}
