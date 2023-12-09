import { CloseButton, Group, TextInput } from '@mantine/core'
import { Dropzone, MIME_TYPES } from '@mantine/dropzone'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { TbPhoto, TbUpload, TbX } from 'react-icons/tb'
import { uploadImage } from '../../api'
import { projectTagAtom } from '../page/top-bar'

export function VideoDrop({
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
	const uploadVideoMutation = useMutation(uploadImage)
	const projectTag = useAtomValue(projectTagAtom)

	const imagePart = src ? (
		<div className="h-[200px]">
			<CloseButton
				onClick={() => onChange('')}
				mb="xs"
				size="xs"
				ml="auto"
				title="Remove video"
			/>
			<video src={src} height={172} controls={false} muted={true} autoPlay={false}>
				Sorry, your browser doesn&apos;t support embedded videos.
			</video>
		</div>
	) : (
		<Dropzone
			onDrop={(files) =>
				uploadVideoMutation.mutate(
					{ projectTag, image: files[0] },
					{ onSuccess: (data) => onChange(data.data.url) }
				)
			}
			accept={[MIME_TYPES.mp4]}
			loading={uploadVideoMutation.isLoading}
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
				{!uploadVideoMutation.isLoading && (
					<Dropzone.Idle>
						<TbPhoto size={50} />
					</Dropzone.Idle>
				)}
				{!uploadVideoMutation.isLoading && (
					<p className="text-center">Drag a video(MP4 format) here or click to select</p>
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
			<TextInput
				size="xs"
				label="Source"
				value={src ?? ''}
				onChange={(event) => onChange(event.target.value)}
				rightSection={rightSection}
			/>
		</div>
	)
}
