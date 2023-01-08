import { CloseButton, Group, Image, TextInput } from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { TbPhoto, TbUpload, TbX } from 'react-icons/tb'
import { uploadImage } from '../../api'
import { projectTagAtom } from '../page/top-bar'
import { Expression } from '../states/expression'
import { SingleIntelinput } from './intelinput'

export function ImageDrop({
	src,
	onChange,
	rightSection,
}: {
	src: string | null
	onChange: (src: string) => void
	rightSection?: ReactNode
}) {
	const uploadImageMutation = useMutation(uploadImage)
	const projectTag = useAtomValue(projectTagAtom)

	const imagePart = src ? (
		<div>
			<CloseButton
				onClick={() => onChange('')}
				mb="xs"
				size="xs"
				ml="auto"
				title="Clear image"
			/>
			<Image radius="xs" src={src} />
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
		>
			<Group position="center" spacing="xl" py="xl" style={{ pointerEvents: 'none' }}>
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
		<div className="space-y-4">
			{imagePart}
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

export function ImageDropWithState({
	src,
	onChange,
}: {
	src: Expression
	onChange: (src: Expression) => void
}) {
	const uploadImageMutation = useMutation(uploadImage)
	const projectTag = useAtomValue(projectTagAtom)

	const imagePart = src.exists() ? (
		<div>
			<CloseButton
				onClick={() => onChange(new Expression())}
				mb="xs"
				size="xs"
				ml="auto"
				title="Clear image"
			/>
			<Image radius="xs" src={src.toString()} />
		</div>
	) : (
		<Dropzone
			onDrop={(files) =>
				uploadImageMutation.mutate(
					{ projectTag, image: files[0] },
					{ onSuccess: (data) => onChange(Expression.fromString(data.data.url)) }
				)
			}
			accept={IMAGE_MIME_TYPE}
			loading={uploadImageMutation.isLoading}
		>
			<Group position="center" spacing="xl" py="xl" style={{ pointerEvents: 'none' }}>
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
		<div className="space-y-4">
			{imagePart}
			<SingleIntelinput label="Source" value={src} onChange={onChange} />
		</div>
	)
}
