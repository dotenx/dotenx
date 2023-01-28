import { Button, Checkbox, MultiSelect } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useClipboard } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { BiCloudUpload } from "react-icons/bi"
import { IoCheckmark, IoCopy } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { getFiles, getUserGroups, QueryKey, setFilesAccess, setFileUserGroup } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Modal, NewModal, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { UploadFileForm } from "../internal/upload-file-form"

export function Files() {
	const modal = useModal()
	const client = useQueryClient()
	const [rowData, setRowData] = useState({ isPublic: false, name: "", projectTag: "" })
	const filesAccessMutation = useMutation(setFilesAccess, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetFiles),
	})
	const clipboard = useClipboard({ timeout: 3000 })
	const [clicked, setClicked] = useState("")
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const filesQuery = useQuery([QueryKey.GetFiles, projectTag], () => getFiles(projectTag), {
		enabled: !!projectTag,
	})
	const [defaultUserGroups, setDefaultUserGroups] = useState([])
	const { onSubmit, ...form } = useForm()
	useEffect(() => {
		form.setValues({ userGroups: defaultUserGroups })
	}, [defaultUserGroups])
	const [userGroupsOptions, setUserGroupsOptions] = useState([{ label: "", value: "" }])
	const fileUserGroupMutation = useMutation(setFileUserGroup, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetFiles),
	})
	useQuery([QueryKey.GetUserGroups, projectTag], () => getUserGroups(projectTag), {
		onSuccess: (data) => {
			const userGroups = Object.values(data.data)
			const userGroupsOptions = userGroups?.map((g) => ({ label: g.name, value: g.name }))
			setUserGroupsOptions(userGroupsOptions)
		},
		enabled: !!projectTag,
	})
	const files = filesQuery.data?.data ?? []
	const helpDetails = {
		title: "You can upload files to your project or allow your users to upload files",
		description:
			"The files uploaded in your project can have different access levels. You can allow your users to upload files or upload files yourself.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<Header title="Files" />
			<ContentWrapper>
				<button
					className="active:translate-y-[2px] flex transition-all px-4 gap-x-2 hover:text-slate-700  hover:bg-slate-50 items-center p-2 rounded-[10px] bg-white  text-slate-900   font-medium"
					onClick={() => modal.open(Modals.UploadFile)}
				>
					<BiCloudUpload className="w-6 h-6" />
					Upload file
				</button>

				<Table
					helpDetails={helpDetails}
					loading={
						projectQuery.isLoading ||
						filesQuery.isLoading ||
						filesAccessMutation.isLoading
					}
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
					data={files}
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
								filesAccessMutation.mutate({ rowData: rowData })
								modal.close()
							}}
							size="xs"
						>
							confirm
						</Button>
					</div>
				</NewModal>
			</ContentWrapper>
			<Modal fluid kind={Modals.FilesUserGroup} title="User groups" size="md">
				{(data: { name: string; userGroup: string[] }) => (
					<div className="flex flex-col">
						<p className="my-6">Select which user groups can access this file</p>
						<form
							className="h-full flex flex-col gap-10"
							onSubmit={onSubmit((values) =>
								fileUserGroupMutation.mutate(
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
							<Button
								loading={fileUserGroupMutation.isLoading}
								className="w-full"
								type="submit"
							>
								Save
							</Button>
						</form>
					</div>
				)}
			</Modal>
			<NewModal kind={Modals.UploadFile} title="Upload file" size="md">
				<UploadFileForm tag={projectTag} />
			</NewModal>
		</div>
	)
}
