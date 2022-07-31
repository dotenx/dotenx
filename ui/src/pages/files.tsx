import { Button } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
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

	return (
		<ContentWrapper>
			<Table
				loading={projectDetailsLoading || filesDataLoading}
				title="Files"
				emptyText="Your files will be displayed here"
				columns={[
					{
						Header: 'Name',
						accessor: 'key',
					},
					{
						Header: 'Permission',
						accessor: 'access',
					},
					{
						Header: 'Owner',
						accessor: 'tpaccount_id',
						Cell: ({ value }: { value: string }) => (
							<span>{value ? value : 'yourself'}</span>
						),
					},
					{
						Header: 'Size',
						accessor: 'size',
						Cell: ({ value }: { value: string }) => <span>{value} kb</span>,
					},
					{
						Header: 'URL',
						accessor: 'url',
						Cell: ({ value }: { value: string }) => (
							<div
								className="text-xs flex items-center justify-end cursor-pointer hover:text-cyan-800"
								onClick={() => clipboard.copy(value)}
							>
								<span className="mr-2 truncate">{value} </span>
								{clipboard.copied ? <IoCheckmark /> : <IoCopy />}
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
