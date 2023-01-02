import { Button, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'
import { z } from 'zod'
import { addToMarketPlace, Component, DesignSystem, uploadProjectImage } from '../../api'

const designSystemSchema = z.object({
	name: z.string().min(1),
	components: z.array(z.string()),
})

type DesignSystemSchema = z.infer<typeof designSystemSchema>

export function DesignSystemMarketplaceForm({
	designSystem,
	projectName,
}: {
	designSystem: DesignSystem
	projectName: string
}) {
	const [file, setFile] = useState<File>()
	const [imgSrc, setImgSrc] = useState()
	const { mutate: mutateUploadProjectImage, isLoading: loadingUploadImage } =
		useMutation(uploadProjectImage)
	const form = useForm<DesignSystemSchema>({ initialValues: { name: '', components: [] } })
	const addToMarketplaceMutation = useMutation(addToMarketPlace, {
		onSuccess: () => closeAllModals(),
	})

	useEffect(() => {
		let fileReader: any
		let isCancel = false
		if (file) {
			fileReader = new FileReader()
			fileReader.onload = (e: any) => {
				const { result } = e.target
				if (result && !isCancel) {
					setImgSrc(result)
				}
			}
			fileReader.readAsDataURL(file)
		}
		return () => {
			isCancel = true
			if (fileReader && fileReader.readyState === 1) {
				fileReader.abort()
			}
		}
	}, [file])
	return (
		<form
			onSubmit={form.onSubmit(() => {
				const formData = new FormData()
				formData.append('file', file ? file : '')
				mutateUploadProjectImage(formData, {
					onSuccess: (data: any) => {
						addToMarketplaceMutation.mutate({
							componentName: designSystem.name,
							projectName,
							category: 'uiDesignSystemItem',
							imageUrl: data.data.url,
						})
					},
				})
			})}
			className="space-y-6"
		>
			<div className="-mt-10 mb-5 font-semibold">
				Add <span className="text-slate-500">{designSystem.name}</span> design system to the
				Marketplace
			</div>
			<div>
				<div className="font-medium mt-3 mb-1 text-sm">Upload preview image: </div>
				<label
					htmlFor="file"
					className="flex items-center shadow-sm cursor-pointer  active:bg-slate-100 active:shadow-none hover:bg-slate-50 transition-all border justify-center  font-medium px-2 w-full py-1  rounded   form-input "
				>
					<span className="mr-2">browse</span>
					<BsFillFolderSymlinkFill />
				</label>
				<input
					name="file"
					accept="image/*"
					id="file"
					className="hidden  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="file"
					required
					onChange={(e) => {
						setFile(e.target.files?.[0])
					}}
					value={undefined}
				/>
			</div>
			{imgSrc ? (
				<p className="img-preview-wrapper mt-2">
					{
						<img
							src={imgSrc}
							className="p-2 border border-dashed rounded"
							alt="preview"
						/>
					}
				</p>
			) : null}
			<Button
				fullWidth
				type="submit"
				loading={addToMarketplaceMutation.isLoading || loadingUploadImage}
			>
				{loadingUploadImage
					? 'Uploading image'
					: addToMarketplaceMutation.isLoading
					? 'Adding'
					: 'Add'}
			</Button>
		</form>
	)
}

const componentSchema = z.object({
	name: z.string().min(2),
})

type ComponentSchema = z.infer<typeof componentSchema>

export function ComponentMarketplaceForm({
	component,
	projectName,
}: {
	component: Component
	projectName: string
}) {
	const form = useForm<ComponentSchema>()
	const [file, setFile] = useState<File>()
	const [imgSrc, setImgSrc] = useState()

	const { mutate: mutateUploadProjectImage, isLoading: loadingUploadImage } =
		useMutation(uploadProjectImage)
	const addToMarketplaceMutation = useMutation(addToMarketPlace, {
		onSuccess: () => {
			closeAllModals()
		},
	})
	useEffect(() => {
		let fileReader: any
		let isCancel = false
		if (file) {
			fileReader = new FileReader()
			fileReader.onload = (e: any) => {
				const { result } = e.target
				if (result && !isCancel) {
					setImgSrc(result)
				}
			}
			fileReader.readAsDataURL(file)
		}
		return () => {
			isCancel = true
			if (fileReader && fileReader.readyState === 1) {
				fileReader.abort()
			}
		}
	}, [file])
	const catagoryList = ['Charts', 'Misc']
	return (
		<form
			onSubmit={form.onSubmit((v) => {
				const formData = new FormData()
				formData.append('file', file ? file : '')
				mutateUploadProjectImage(formData, {
					onSuccess: (data: any) => {
						addToMarketplaceMutation.mutate({
							componentName: component.name,
							projectName,
							category: v.category,
							imageUrl: data.data.url,
						})
					},
				})
			})}
		>
			<div className="-mt-10 mb-5 font-semibold">
				Add <span className="text-slate-500">{component.name}</span> component to the
				Marketplace
			</div>
			<Select
				label="Category"
				defaultValue={'Misc'}
				data={catagoryList}
				{...form.getInputProps('category')}
			/>
			<div>
				<div className="font-medium mt-3 mb-1 text-sm">Upload preview image: </div>
				<label
					htmlFor="file"
					className="flex items-center shadow-sm cursor-pointer  active:bg-slate-100 active:shadow-none hover:bg-slate-50 transition-all border justify-center  font-medium px-2 w-full py-1  rounded   form-input "
				>
					<span className="mr-2">browse</span>
					<BsFillFolderSymlinkFill />
				</label>
				<input
					name="file"
					accept="image/*"
					id="file"
					className="hidden  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="file"
					required
					onChange={(e) => {
						setFile(e.target.files?.[0])
					}}
					value={undefined}
				/>
			</div>
			{imgSrc ? (
				<p className="img-preview-wrapper mt-2">
					{
						<img
							src={imgSrc}
							className="p-2 border border-dashed rounded"
							alt="preview"
						/>
					}
				</p>
			) : null}
			<Button
				fullWidth
				mt="xl"
				type="submit"
				loading={addToMarketplaceMutation.isLoading || loadingUploadImage}
			>
				{loadingUploadImage
					? 'Uploading image'
					: addToMarketplaceMutation.isLoading
					? 'Adding'
					: 'Add'}
			</Button>
		</form>
	)
}
