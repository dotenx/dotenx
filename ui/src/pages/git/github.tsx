import { Button, Group, Loader, Modal, Select, Text, TextInput, Tooltip } from '@mantine/core'
import { forwardRef, ReactElement, useEffect, useState } from 'react'
import { ImInfo, ImWarning } from 'react-icons/im'
import { FaBars, FaPlus } from 'react-icons/fa'
import { useMutation, useQuery } from 'react-query'
import {
	getGitAccounts,
	getRepoList,
	getBranchList,
	QueryKey,
	exportProject,
	importProject,
} from '../../api'
import { BsGithub } from 'react-icons/bs'
import { Loader as LinearLoader } from '../../features/ui'
import { useParams } from 'react-router-dom'
import { BiGitRepoForked } from 'react-icons/bi'
import { TbFileImport, TbPackgeExport } from 'react-icons/tb'
import { toast } from 'react-toastify'
interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	icon?: ReactElement
	label: string
	value: string
}
const GithubIntegration = ({ resetProvider }: { resetProvider: () => void }) => {
	const [selectOptions, setSelectOptions] = useState<typeof staticOptions>([])
	const [selectedValue, setSelectedValue] = useState<string>()
	const [repoList, setRepoList] = useState<string[]>()
	const [showError, setShowError] = useState(false)
	const [selectedRepo, setSelectedRepo] = useState('')
	const staticOptions = [
		{ label: 'Add Github Account', value: 'add', icon: <FaPlus className="w-5 h-5" /> },
		{ label: 'Swith Git Provider', value: 'switch', icon: <FaBars className="w-5 h-5" /> },
	]
	const { isLoading } = useQuery([QueryKey.GetGitAccounts], () => getGitAccounts('github'), {
		onError: (err: any) => {
			if (err.response.status === 404) {
				window.open(
					'https://api.dotenx.com/git/integration/auth/github',
					'targetWindow',
					`toolbar=no,
				 location=no,
				 status=no,
				 menubar=no,
				 scrollbars=yes,
				 resizable=yes,`
				)
			}
		},
		onSuccess: (data) => {
			setSelectOptions(
				data.data
					.map((d) => ({
						label: d.git_username,
						value: d.git_account_id,
						icon: <BsGithub className="w-5 h-5" />,
					}))
					.concat(staticOptions)
			)
		},
	})
	const { mutate, isLoading: repoListLoading } = useMutation(getRepoList, {
		onSuccess: (d) => {
			setRepoList(
				d.data.repositories.map((d) => {
					return d.full_name
				})
			)
		},
		onError: () => setShowError(true),
	})
	const [openModal, setOpenModal] = useState<'export' | 'import' | ''>('')
	useEffect(() => {
		if (selectedValue === 'add') {
			window.open(
				'https://api.dotenx.com/git/integration/auth/github',
				'targetWindow',
				`toolbar=no,
		 location=no,
		 status=no,
		 menubar=no,
		 scrollbars=yes,
		 resizable=yes,`
			)
			setSelectedValue('')
		} else if (selectedValue === 'switch') {
			resetProvider()
		} else if (selectedValue) {
			mutate({ provider: 'github', gitId: selectedValue })
		}
	}, [selectedValue])

	const handleAuthorizeClick = () => {
		window.open(
			'https://api.dotenx.com/git/integration/auth/github',
			'targetWindow',
			`toolbar=no,
		 location=no,
		 status=no,
		 menubar=no,
		 scrollbars=yes,
		 resizable=yes,`
		)
	}
	const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
		({ icon, label, ...others }: ItemProps, ref) => (
			<div ref={ref} {...others}>
				<Group noWrap>
					{icon ? icon : <div className="w-5 h-5"></div>}

					<div>
						<Text size="md" className=" font-medium">
							{label}
						</Text>
					</div>
				</Group>
			</div>
		)
	)
	SelectItem.displayName = 'SelectItem'
	if (isLoading)
		return (
			<div className="mx-auto w-1/2 mt-40">
				<LinearLoader />
			</div>
		)
	return (
		<div className="mx-auto bg-rose-100  rounded-md p-5 w-2/3">
			<Select
				radius={'md'}
				placeholder="Select a git account"
				className="w-1/3"
				itemComponent={SelectItem}
				value={selectedValue}
				data={selectOptions}
				onChange={(v: string) => setSelectedValue(v)}
			/>
			{showError ? (
				<div className="h-[400px] flex items-center justify-center">
					<div
						onClick={() => handleAuthorizeClick()}
						className="font-medium underline-offset-1 underline cursor-pointer hover:text-cyan-900  text-cyan-600 mr-1 "
					>
						Authorize
					</div>
					your account to see repository list
				</div>
			) : (
				<div
					className={`font-medium w-full h-[400px] overflow-y-auto   mt-2 ${
						!repoList && 'flex items-center'
					}`}
				>
					{repoListLoading ? (
						<Loader className="mx-auto mt-5" />
					) : repoList ? (
						<div>
							<Tooltip
								withinPortal
								openDelay={700}
								label="Link your DoTenX account with your Git account to save your project and import it again."
							>
								<div className="flex w-fit  cursor-default items-center mt-4 mb-2 text-base">
									Repositories <ImInfo className="w-3 h-3 ml-1 mb-2 " />
								</div>
							</Tooltip>
							{repoList.map((repoName) => (
								<div
									key={repoName}
									className="w-full my-2 flex items-center justify-between rounded-md bg-rose-600 shadow-sm  p-5  "
								>
									<div className="text-white w-80 truncate">{repoName}</div>
									<div className="flex items-center gap-x-5">
										<Button
											rightIcon={<TbPackgeExport className="w-5 h-5" />}
											onClick={() => {
												setSelectedRepo(repoName)
												setOpenModal('export')
											}}
											radius={'md'}
											variant="light"
										>
											Export
										</Button>
										<Button
											rightIcon={<TbFileImport className="w-5 h-5" />}
											onClick={() => {
												setSelectedRepo(repoName)

												setOpenModal('import')
											}}
											radius={'md'}
											variant="light"
										>
											Import
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<span className=" text-center w-4/5 mx-auto">
							Select or add a GitHub account to see your Git repositories.
						</span>
					)}
				</div>
			)}
			<Modal
				opened={openModal === 'export'}
				onClose={() => setOpenModal('')}
				title="Export Project"
			>
				<ExportRepoModal
					closeModal={() => setOpenModal('')}
					gitId={selectedValue || ''}
					repoName={selectedRepo}
				/>
			</Modal>
			<Modal
				opened={openModal === 'import'}
				onClose={() => setOpenModal('')}
				title="Import Project"
			>
				<ImportRepoModal
					closeModal={() => setOpenModal('')}
					gitId={selectedValue || ''}
					repoName={selectedRepo}
				/>
			</Modal>
		</div>
	)
}

const ExportRepoModal = ({
	gitId,
	repoName,
	closeModal,
}: {
	gitId: string
	repoName: string
	closeModal: () => void
}) => {
	const { projectName = '' } = useParams()

	const [commitMessage, setCommitMessage] = useState('')

	const { data, isLoading } = useQuery([QueryKey.GetBranchList, repoName], () =>
		getBranchList({
			provider: 'github',
			gitId,
			repoName,
		})
	)
	const branches = data?.data?.branches?.map((d) => d.name) || []
	const [branchName, setBranchName] = useState(branches[0])

	const { mutate, isLoading: repoListLoading } = useMutation(exportProject, {
		onSuccess: () => {
			toast('Export successfuly done.', { type: 'success', autoClose: 2000 })
			closeModal()
		},
		onError: () => {
			toast('Something went wrong. Please try again later', {
				type: 'error',
				autoClose: 2000,
			})
		},
	})
	return (
		<div>
			<div className="text-sm mb-2 p-1 w-fit bg-slate-100 rounded-md flex items-center">
				<span className="opacity-75 mr-1">{repoName}</span>
				<BiGitRepoForked />
			</div>
			{isLoading || !branches ? (
				<div className="my-4 flex justify-start w-full ">
					<LinearLoader />
				</div>
			) : (
				<Select
					label="Select branch"
					defaultValue={branchName}
					data={branches}
					onChange={(v: string) => {
						setBranchName(v)
					}}
				/>
			)}
			<TextInput
				className="mt-3 mb-4"
				label="Commit message"
				placeholder="Message"
				required
				error={
					commitMessage.length > 72 && 'The commit message is limited to 72 characters'
				}
				value={commitMessage}
				onChange={(event) => setCommitMessage(event.currentTarget.value)}
			/>
			<Button
				disabled={commitMessage.length === 0 || commitMessage.length > 72 || !branchName}
				loading={repoListLoading}
				onClick={() => {
					mutate({
						provider: 'github',
						projectName,
						gitId,
						repoName,
						branchName,
						commitMessage,
					})
				}}
				className="float-right"
			>
				Export
			</Button>
		</div>
	)
}
const ImportRepoModal = ({
	gitId,
	repoName,
	closeModal,
}: {
	gitId: string
	repoName: string
	closeModal: () => void
}) => {
	const { projectName = '' } = useParams()

	const { data, isLoading } = useQuery([QueryKey.GetBranchList, repoName], () =>
		getBranchList({
			provider: 'github',
			gitId,
			repoName,
		})
	)
	const branches = data?.data?.branches?.map((d) => d.name) || []
	const [branchName, setBranchName] = useState(branches[0])

	const { mutate, isLoading: repoListLoading } = useMutation(importProject, {
		onSuccess: () => {
			toast('Import successfuly done.', { type: 'success', autoClose: 2000 })
			closeModal()
		},
		onError: () => {
			toast('Something went wrong. Please try again later', {
				type: 'error',
				autoClose: 2000,
			})
		},
	})
	return (
		<div>
			<div className="flex items-start font-sm gap-x-1">
				<ImWarning className="h-5 w-5 mt-1" />
				By importing, it&apos;s possible to lose parts of the project changes that are not
				in Git
			</div>
			<div className="text-sm mt-4 mb-2 p-1 w-fit bg-slate-100 rounded-md flex items-center">
				<span className="opacity-75 mr-1">{repoName}</span>
				<BiGitRepoForked />
			</div>
			{isLoading || !branches ? (
				<div className="my-4 flex justify-start w-full ">
					<LinearLoader />
				</div>
			) : (
				<Select
					label="Select branch"
					defaultValue={branchName}
					data={branches}
					onChange={(v: string) => {
						setBranchName(v)
					}}
				/>
			)}
			<Button
				disabled={!branchName}
				loading={repoListLoading}
				onClick={() => {
					mutate({
						provider: 'github',
						projectName,
						gitId,
						repoName,
						branchName,
					})
				}}
				className="float-right mt-4"
			>
				Import
			</Button>
		</div>
	)
}

export default GithubIntegration
