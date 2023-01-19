import { Button, Checkbox, MultiSelect } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useClipboard } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { BiCloudUpload } from "react-icons/bi"
import { IoCheckmark, IoCopy, IoReload } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import {
	getFiles,
	getProject,
	getUserGroups,
	QueryKey,
	setFilesAccess,
	setFileUserGroup,
} from "../api"
import { Modals, useModal } from "../features/hooks"
import {
	AddButton,
	ContentWrapper,
	Content_Wrapper,
	Form,
	Header,
	Modal,
	NewModal,
	Table,
} from "../features/ui"
import { UploadFileForm } from "../internal/upload-file-form"

export default function Files() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <FilesTableContent projectName={projectName} />
}

function FilesTableContent({ projectName }: { projectName: string }) {
	const modal = useModal()
	const [rowData, setRowData] = useState({ isPublic: false, name: "", projectTag: "" })

	const client = useQueryClient()
	const { mutate, isLoading: changeAccessisLoading } = useMutation(setFilesAccess, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetFiles),
	})

	const clipboard = useClipboard({ timeout: 3000 })
	const [clicked, setClicked] = useState("")
	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)

	const projectTag = projectDetails?.data.tag ?? ""

	const { data: filesData, isLoading: filesDataLoading } = useQuery(
		QueryKey.GetFiles,
		() => getFiles(projectTag),
		{ enabled: !!projectTag }
	)

	const [defaultUserGroups, setDefaultUserGroups] = useState([])
	const { onSubmit, ...form } = useForm()
	useEffect(() => {
		form.setValues({ userGroups: defaultUserGroups })
	}, [defaultUserGroups])
	const [userGroupsOptions, setUserGroupsOptions] = useState([{ label: "", value: "" }])

	const { mutate: mutateFileUserGroup, isLoading: isUserGroupLoading } = useMutation(
		setFileUserGroup,
		{
			onSuccess: () => client.invalidateQueries(QueryKey.GetFiles),
		}
	)

	useQuery([QueryKey.GetUserGroups, projectTag], () => getUserGroups(projectTag), {
		onSuccess: (data) => {
			const userGroups = Object.values(data.data)
			const userGroupsOptions = userGroups?.map((g) => ({ label: g.name, value: g.name }))
			setUserGroupsOptions(userGroupsOptions)
		},
		enabled: !!projectTag,
	})

	const tableData = filesData?.data ?? []
	const helpDetails = {
		title: "You can upload files to your project or allow your users to upload files",
		description:
			"The files uploaded in your project can have different access levels. You can allow your users to upload files or upload files yourself.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}
	// refresh => queryClient.invalidateQueries(QueryKey.GetFiles)}
	return (
		<div>
			<Header title={"Files"} />
			<Content_Wrapper>
				<AddButton
					text="Upload file"
					icon={<BiCloudUpload className="w-6 h-6" />}
					handleClick={() => modal.open(Modals.UploadFile)}
				/>
				<Table
					helpDetails={helpDetails}
					loading={projectDetailsLoading || filesDataLoading || changeAccessisLoading}
					emptyText="Your files will be displayed here"
					columns={[
						{
							Header: "Name",
							accessor: "key",
							Cell: ({ value }: { value: string }) => (
								<span className="text-xs truncate">{value}</span>
							),
						},
						{
							Header: "Size",
							accessor: "size",
							Cell: ({ value }: { value: number }) => (
								<span className="whitespace-nowrap">
									{(value / 1000).toFixed(1)} kb
								</span>
							),
						},

						{
							Header: "Public",
							accessor: "is_public",
							Cell: ({ value, row }: { value: boolean; row: any }) => (
								<Checkbox
									readOnly
									checked={value}
									onClick={() => {
										setRowData({
											isPublic: value,
											projectTag: row.original.project_tag,
											name: row.original.key,
										}),
											modal.open(Modals.ConfirmCheckbox)
									}}
								/>
							),
						},

						{
							Header: "User groups",
							accessor: "user_groups",
							Cell: ({ value, row }: { value: string[]; row: any }) => (
								<div
									className={`text-slate-700 ${
										row.original.is_public
											? "pointer-events-none pl-6"
											: "cursor-pointer hover:opacity-80 text-xs font-medium "
									}`}
									onClick={() => {
										setDefaultUserGroups(row.original.user_groups)
										modal.open(Modals.FilesUserGroup, {
											name: row.original.key,
											userGroup: value,
										})
									}}
								>
									{row.original.is_public ? "_" : "Show / Edit"}
								</div>
							),
						},
						{
							Header: "URL",
							accessor: "url",
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
				/>
				<NewModal kind={Modals.ConfirmCheckbox} title="Change file access" size="xl">
					<h2>
						Are you sure you want to change{" "}
						<span className="text-sky-900">{rowData.name}</span> access to{" "}
						{rowData.isPublic ? "private" : "public"}?
					</h2>
					<div className="flex items-center justify-end">
						<Button
							className="mr-2"
							onClick={() => modal.close()}
							variant="subtle"
							color="gray"
							size="xs"
						>
							cancel
						</Button>
						<Button
							onClick={() => {
								mutate({ rowData: rowData }), modal.close()
							}}
							size="xs"
						>
							confirm
						</Button>
					</div>
				</NewModal>
			</Content_Wrapper>
			<Modal fluid kind={Modals.FilesUserGroup} title="User groups" size="md">
				{(data: { name: string; userGroup: string[] }) => (
					<div className="flex flex-col">
						<p className="my-6">Select which user groups can access this file</p>
						<Form
							className="h-full"
							onSubmit={onSubmit((values) =>
								mutateFileUserGroup(
									{
										name: data.name,
										payload: values,
										projectTag,
									},
									{ onSuccess: () => modal.close() }
								)
							)}
						>
							<div className="flex flex-col gap-5 pb-10 grow ">
								<MultiSelect
									searchable
									clearable
									label="Select"
									data={userGroupsOptions}
									{...form.getInputProps("userGroups")}
								/>
							</div>
							<Button loading={isUserGroupLoading} className="w-full" type="submit">
								Save
							</Button>
						</Form>
					</div>
				)}
			</Modal>
			<NewModal kind={Modals.UploadFile} title="Upload file" size="md">
				<UploadFileForm tag={projectTag} />
			</NewModal>
		</div>
	)
}
