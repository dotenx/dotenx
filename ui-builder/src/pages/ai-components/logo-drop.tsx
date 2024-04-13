import { CloseButton, Group, Image } from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { TbPhoto, TbUpload, TbX } from 'react-icons/tb'
import { uploadLogo } from '../../api'

export function LogoDrop({
	src,
	onChange,
	rightSection,
	label,
}: {
	src: string | null
	onChange: ({ url, key }: { url: string; key: string }) => void
	rightSection?: ReactNode
	label?: string
}) {
	const uploadLogoMutation = useMutation(uploadLogo)
	const imagePart = src ? (
		<div className="h-[200px]">
			<CloseButton
				onClick={() => onChange({ url: '', key: '' })}
				mb="xs"
				size="xs"
				ml="auto"
				title="Clear image"
			/>
			<Image
				height={172}
				className="border border-dashed p-3 rounded-md"
				radius="xs"
				src={src}
				fit="contain"
			/>
		</div>
	) : (
		<Dropzone
			onDrop={(files) =>
				uploadLogoMutation.mutate(
					{ image: files[0] },
					{ onSuccess: (data) => onChange({ url: data.data.url, key: data.data.key }) }
				)
			}
			accept={IMAGE_MIME_TYPE}
			loading={uploadLogoMutation.isLoading}
			h={200}
			style={{ display: 'flex', alignItems: 'center' }}
		>
			<Group position="center" spacing="xl" py="xl" style={{ pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<TbUpload />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<TbX />
				</Dropzone.Reject>
				{!uploadLogoMutation.isLoading && (
					<Dropzone.Idle>
						<TbPhoto size={50} />
					</Dropzone.Idle>
				)}
				{!uploadLogoMutation.isLoading && (
					<p className="text-center">Drag an image here or click to select</p>
				)}
			</Group>
		</Dropzone>
	)

	return (
		<div className="space-y-4">
			<div>
				{label && <p className="mb-0.5 font-medium">{label}</p>}
				{imagePart}
			</div>
			{/* <TextInput
				size="xs"
				label="Source"
				value={src ?? ''}
				onChange={(event) => onChange(event.target.value)}
				rightSection={rightSection}
			/> */}
		</div>
	)
}
