import { Button } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'
import { IoCheckmark, IoCopy, IoReload } from 'react-icons/io5'
import { useQuery, useQueryClient } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getFiles, getProject, QueryKey } from '../api'
import { Modals, useModal } from '../features/hooks'
import { ContentWrapper, NewModal, Table } from '../features/ui'
import { UploadFileForm } from '../internal/upload-file-form'

export default function Files() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <FilesTableContent projectName={projectName} />
}

function FilesTableContent({ projectName }: { projectName: string }) {
	const clipboard = useClipboard({ timeout: 3000 })
	const [clicked, setClicked] = useState('')
	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)

	const projectTag = projectDetails?.data.tag ?? ''

	const { data: filesData, isLoading: filesDataLoading } = useQuery(
		QueryKey.GetFiles,
		() => getFiles(projectTag),
		{ enabled: !!projectTag }
	)
	const tableData = filesData?.data ?? []

	const helpDetails = {
		title: 'You can upload files to your project or allow your users to upload files',
		description:
			'The files uploaded in your project can have different access levels. You can allow your users to upload files or upload files yourself.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/files',
	}

	return (
		<ContentWrapper className="lg:pr-0 lg:pl-44 ">
			<Table
				helpDetails={helpDetails}
				loading={projectDetailsLoading || filesDataLoading}
				title="Files"
				emptyText="Your files will be displayed here"
				columns={[
					{
						Header: 'Name',
						accessor: 'key',
						Cell: ({ value }: { value: string }) => (
							<span className="text-xs truncate">{value}</span>
						),
					},
					{
						Header: 'Permission',
						accessor: 'access',
					},
					{
						Header: 'Owner',
						accessor: 'tpaccount_id',
						Cell: ({ value }: { value: string }) => (
							<span className="text-sm">{value ? value : 'yourself'}</span>
						),
					},
					{
						Header: 'Size',
						accessor: 'size',
						Cell: ({ value }: { value: number }) => (
							<span className="whitespace-nowrap">
								{(value / 1000).toFixed(1)} kb
							</span>
						),
					},
					{
						Header: 'URL',
						accessor: 'url',
						Cell: ({ value }: { value: string }) => (
							<div
								className="text-xs flex items-center justify-end cursor-pointer hover:text-cyan-800"
								onClick={() => {
									clipboard.copy(value), setClicked(value)
								}}
							>
								<span className="mr-2 truncate max-w-sm">{value}</span>
								{clipboard.copied && clicked === value ? (
									<IoCheckmark />
								) : (
									<IoCopy />
								)}
							</div>
						),
					},
				]}
				data={tableData}
				actionBar={<ActionBar projectTag={projectTag} />}
			/>
		</ContentWrapper>
	)
}

function ActionBar({ projectTag }: { projectTag: string }) {
	const modal = useModal()
	const queryClient = useQueryClient()

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					leftIcon={<IoReload />}
					type="button"
					onClick={() => queryClient.invalidateQueries(QueryKey.GetFiles)}
				>
					Refresh
				</Button>
				<Button onClick={() => modal.open(Modals.UploadFile)}>Upload file</Button>
			</div>
			<NewModal kind={Modals.UploadFile} title="Upload file" size="xl">
				<UploadFileForm tag={projectTag} />
			</NewModal>
		</>
	)
}
