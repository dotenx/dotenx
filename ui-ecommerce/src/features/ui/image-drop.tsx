import { CloseButton, Group, Image, TextInput } from "@mantine/core"
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone"
import { useMutation } from "react-query"
import { ReactNode } from "react"
import { TbPhoto, TbUpload, TbX } from "react-icons/tb"
import { uploadImage } from "../../api"
import { useGetProjectTag } from "./hooks/use-get-project-tag"

export function ImageDrop({
	src,
	onChange,
	rightSection,
	label,
}: {
	src: string | null
	onChange: (src: string) => void
	rightSection?: ReactNode
	label?: string
}) {
	const uploadImageMutation = useMutation(uploadImage)
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag

	const imagePart = src ? (
		<div className="h-[200px]">
			<CloseButton
				onClick={() => onChange("")}
				mb="xs"
				size="xs"
				ml="auto"
				title="Clear image"
			/>
			<Image height={172} radius="xs" src={src} />
		</div>
	) : (
		<Dropzone
			onDrop={(files) =>
				uploadImageMutation.mutate(
					{ projectTag, image: files[0] },
					{ onSuccess: (data) => onChange(data.data.url) }
				)
			}
			accept={IMAGE_MIME_TYPE}
			loading={uploadImageMutation.isLoading}
			h={200}
			sx={{ display: "flex", alignItems: "center" }}
		>
			<Group position="center" spacing="xl" py="xl" style={{ pointerEvents: "none" }}>
				<Dropzone.Accept>
					<TbUpload />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<TbX />
				</Dropzone.Reject>
				{!uploadImageMutation.isLoading && (
					<Dropzone.Idle>
						<TbPhoto size={50} />
					</Dropzone.Idle>
				)}
				{!uploadImageMutation.isLoading && (
					<p className="text-center">Drag an image here or click to select</p>
				)}
			</Group>
		</Dropzone>
	)

	return (
		<div>
			<div>
				{label && <p className="mb-0.5 font-medium">{label}</p>}
				{imagePart}
			</div>
			<TextInput
				size="xs"
				label="Source"
				value={src ?? ""}
				onChange={(event) => onChange(event.target.value)}
				rightSection={rightSection}
				name="image"
			/>
		</div>
	)
}
