import { Button, Modal } from '@mantine/core'
import { useState } from 'react'
import { MdOutlineDeleteForever } from 'react-icons/md'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteProvider, getProviders, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { AddButton, Content_Wrapper, Header } from '../ui'

export function ProviderList() {
	const modal = useModal()

	const client = useQueryClient()
	const query = useQuery(QueryKey.GetProviders, getProviders)
	const [openModal, setOpenModal] = useState(false)
	const deleteMutation = useMutation(deleteProvider, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetProviders),
	})
	const providers = query.data?.data

	const helpDetails = {
		title: 'In order to integrate your application with third party services, you need to add a provider',
		description:
			'Each provider requires specific configuration. You can find the configuration details in the documentation of the provider.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/files',
	}
	return (
		<div>
			<Header title="Providers" subtitle="Connect to other services." />
			<Content_Wrapper>
				<AddButton
					text="New Providers"
					handleClick={() => modal.open(Modals.NewProvider)}
				/>

				<div className="grid grid-cols-3 gap-x-10">
					{providers?.map((p) => {
						const imageUrl = () => {
							switch (p.type) {
								case 'google':
									return 'https://files.dotenx.com/7e467928-5267-4bd2-8665-245028533690.png'
								case 'instagram':
									return 'https://files.dotenx.com/6651658e-c8d2-4593-8f1b-be107c692faf.png'
								case 'discord':
									return 'https://files.dotenx.com/819c2274-b428-413e-8531-fc36340de72c.png'
								case 'typeform':
									return 'https://files.dotenx.com/099cae2c-f0cd-43f7-93bb-db2603b29cbc.png'
								case 'dropbox':
									return 'https://files.dotenx.com/8c68c03a-5876-4a5d-b8a5-8158ca772c1c.png'
								case 'ebay':
									return 'https://files.dotenx.com/31a9e7bb-9655-40c4-9c3f-a85516ab6f3f.png'
								case 'facebook':
									return 'https://files.dotenx.com/ae4d36e6-afe0-45e3-8b9c-b9fd5d7ccd14.png'
								case 'slack-bot':
									return 'https://files.dotenx.com/6bf34bf3-a8ea-4547-97e4-9fab4fb71b95.png'
								case 'twitter':
									return 'https://files.dotenx.com/81fa98a7-50a0-426c-b6be-a5ba51e322ab.png'
								case 'mailchimp':
									return 'https://files.dotenx.com/171735e7-cf41-4405-83ea-310d1e4a33ef.png'
								default:
									return 'https://files.dotenx.com/4b613007-c386-4a10-8080-79a42c349a75.png'
							}
						}
						return (
							<div
								key={p.name}
								className="flex cursor-default group  mt-5 p-3 gap-x-4 items-center bg-white rounded-[10px] shadow-md"
							>
								<img src={imageUrl()} className="h-[60px] w-[60px]" />
								<div className="flex-col  w-full   items-start">
									<div className="uppercase  text-sm text-gray-500 flex w-full justify-between items-center">
										<div className="w-full">{p.type}</div>
										<div
											onClick={() => setOpenModal(true)}
											className="transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer "
										>
											<MdOutlineDeleteForever className="h-8 w-8 active:text-red-600 transition-all duration-200 hover:opacity-75 hover:text-red-800" />
										</div>
									</div>
									<div className="text-2xl font-medium  w-full">{p.name}</div>
								</div>
								<Modal
									centered
									overlayOpacity={0.55}
									opened={openModal}
									onClose={() => setOpenModal(false)}
									title="Delete Provider"
								>
									<ConfirmDeleteModal
										title={
											<span>
												Are you sure you want to delete{' '}
												<span className="text-slate-600">{p.name}</span>{' '}
												provider?
											</span>
										}
										closeModal={() => setOpenModal(false)}
										onConfirm={() => deleteMutation.mutate(p.name)}
									/>
								</Modal>
							</div>
						)
					})}
				</div>
			</Content_Wrapper>
		</div>
	)
}

const ConfirmDeleteModal = ({
	title,
	closeModal,
	onConfirm,
}: {
	title: JSX.Element | string
	closeModal: () => void
	onConfirm: () => void
}) => {
	return (
		<div>
			<div>{title}</div>
			<div className="w-full mt-5 flex justify-end gap-5">
				<button className="p-2 " onClick={() => closeModal()}>
					Cancel
				</button>
				<Button onClick={() => onConfirm()}>Confirm</Button>
			</div>
		</div>
	)
}
