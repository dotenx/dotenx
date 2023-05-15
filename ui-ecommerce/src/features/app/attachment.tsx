import { Button } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { BiCloudUpload } from "react-icons/bi"
import { BsFillFolderSymlinkFill } from "react-icons/bs"
import { uploadFile } from "../../api"

export function AttachmentPage({
	tag,
	setValues,
	values,
}: {
	tag: string
	values: any
	setValues: any
}) {
	const [file, setFile] = useState<File>()
	const [fileNames, setFileNames] = useState<string[]>(values.file_names)
	const [fileDisplayNames, setDisplayFileNames] = useState<
		{ display_name: string; file_name: string }[]
	>(values.metadata.files ?? [])
	const form = useForm({
		initialValues: { file: undefined, isPublic: false },
	})

	const mutation = useMutation(
		() => {
			const formData = new FormData()
			formData.append("file", file ? file : "")
			formData.append("is_public", "false")
			return uploadFile(tag, formData)
		},
		{
			onSuccess: (data: any) => {
				setFile(undefined),
					setFileNames((current) => [...current, data.data.fileName]),
					setDisplayFileNames((current) => [
						...current,
						{ display_name: data.data.displayName, file_name: data.data.fileName },
					])
			},
		}
	)
	useEffect(() => {
		setValues({
			file_names: fileNames,
			metadata: {
				files: fileDisplayNames,
			},
		})
	}, [fileNames])
	const onSubmit = form.onSubmit(() => mutation.mutate())

	return (
		<div className="w-1/2 bg-white p-5 rounded mx-auto mt-5 ">
			<form className="flex flex-col gap-5" onSubmit={onSubmit}>
				<div className="grid grid-cols-1">
					<div className="flex flex-col gap-1 ">
						<span className="text-sm font-medium">Choose file: </span>
						<label
							htmlFor="file"
							className="flex items-center shadow-sm cursor-pointer    px-5  active:bg-slate-100 active:shadow-none hover:bg-slate-50 transition-all border justify-center  font-medium  w-full py-1  rounded   form-input "
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
					{file ? (
						<div className="border border-dotted mt-4  p-1 rounded">
							<span className="font-medium">file name: </span>
							<span className="truncate">{file?.name}</span>
							<br /> <span className="font-medium">file size: </span>
							{(file?.size / 1000).toFixed(1) + "kb"}
						</div>
					) : (
						<div></div>
					)}
				</div>
				<div className="flex justify-end">
					<Button
						disabled={!file}
						leftIcon={<BiCloudUpload className="w-6 h-6" />}
						onClick={() => onSubmit()}
						loading={mutation.isLoading}
						type="button"
						variant="default"
					>
						Upload file
					</Button>
				</div>
			</form>
			{fileDisplayNames?.length > 0 && (
				<div className="mt-2 border">
					{fileDisplayNames?.map((n, index) => (
						<div
							key={index}
							className={`text-xs ${
								index % 2 !== 0 ? "bg-white" : "bg-slate-50"
							} w-full p-1 `}
						>
							{n.display_name}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
