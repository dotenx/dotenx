import { Button, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { useState } from "react"
import { toast } from "react-toastify"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Navigate } from "react-router-dom"
import { GetDomainResponse, QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { addDomain, getDomains, verifyDomain } from "../api"
import { ContentWrapper, Header } from "../features/ui/header"
import { IoCheckmark, IoCopy } from "react-icons/io5"
import { z } from "zod"
import { Loader } from "../features/ui/loader"
import { useClipboard } from "@mantine/hooks"
import useScreenSize from "../features/hooks/use-screen-size"

export function DomainsPage() {
	const { projectTag, projectName, isLoading: projectTagisLoading } = useGetProjectTag()
	const [isDomainAdded, setIsDomainAdded] = useState<boolean>()
	const getDomainsQuery = useQuery(
		[QueryKey.GetDomains, projectTag],
		() => getDomains(projectTag),
		{
			enabled: !!projectTag,
			onSuccess: (data: any) => {
				if (data.data.tls_arn) setIsDomainAdded(true)
				else setIsDomainAdded(false)
			},
			onError: (err: any) => {
				if (err.response.status === 404) setIsDomainAdded(false)
			},
		}
	)

	if (!projectName) return <Navigate to="/" replace />

	const helpDetails = {
		title: "Set a custom domain for your application instead of using the default domain",
		description:
			"You can set a custom domain for your application to be used by your users. In order to use the domain you need to verify it first.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/domains",
	}
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
	return (
		<div>
			<Header title={"Domains"} />
			<ContentWrapper>
				{getDomainsQuery.isLoading ||
				projectTagisLoading ||
				getDomainsQuery.isRefetching ? (
					<Loader className="mx-auto mt-16" />
				) : (
					<div className={`${smallScreen ? " " : "px-20 max-w-4xl"} mx-auto py-10    `}>
						{isDomainAdded ? (
							<Domain
								projectTag={projectTag}
								domainData={getDomainsQuery?.data?.data}
							/>
						) : (
							<AddDomain projectTag={projectTag} />
						)}
					</div>
				)}
			</ContentWrapper>
		</div>
	)
}

const Domain = ({
	projectTag,
	domainData,
}: {
	projectTag: string
	domainData: GetDomainResponse | undefined
}) => {
	const client = useQueryClient()
	const clipboard = useClipboard({ timeout: 3000 })
	const [clicked, setClicked] = useState("")

	const { mutate, isLoading } = useMutation(verifyDomain, {
		onSuccess: () => {
			toast("Domain verified successfuly", { type: "success", autoClose: 2000 }),
				client.invalidateQueries([QueryKey.GetDomains])
		},
		onError: () => {
			toast("External domain is not verified", { type: "error", autoClose: 2000 })
		},
	})
	return (
		<div className="grid grid-cols-1 gap-3 ">
			<div className="p-3 text-left border-2 rounded-md bg-white space-y-2 ">
				<div className="font-semibold">Domain</div>
				<div>
					<a
						target={"_blank"}
						rel="noreferrer"
						href={"//" + domainData?.external_domain}
						className="text-lg transition-colors text-cyan-600 hover:text-cyan-500"
					>
						{domainData?.external_domain}
					</a>
				</div>
				{domainData && !!domainData.cdn_arn ? (
					<span className="float-right font-medium text-green-500">verified</span>
				) : (
					<div>
						<div className=" border p-2 rounded-md bg-gray-50 mb-2">
							<span className="font-semibold">
								Please add these two CNAME records to your domain’s DNS.
							</span>
							<div className="text-sm">If you need help contact support.</div>
							<div className="grid grid-cols-2  text-sm gap-4 my-4">
								<div className="truncate">
									name
									<div className="bg-white p-1 ">
										<div
											className="text-xs flex items-center justify-between cursor-pointer hover:text-cyan-800"
											onClick={() => {
												clipboard.copy(
													domainData?.tls_validation_record_name
												),
													setClicked(
														domainData?.tls_validation_record_name || ""
													)
											}}
										>
											<span className="mr-2 truncate  ">
												{domainData?.tls_validation_record_name}
											</span>
											{clipboard.copied &&
											clicked === domainData?.tls_validation_record_name ? (
												<IoCheckmark className="w-3 h-3" />
											) : (
												<IoCopy className="w-3 h-3" />
											)}
										</div>
									</div>
								</div>
								<div className="truncate">
									value
									<div className="bg-white p-1 ">
										<div
											className="text-xs flex items-center justify-between cursor-pointer hover:text-cyan-800"
											onClick={() => {
												clipboard.copy(
													domainData?.tls_validation_record_value
												),
													setClicked(
														domainData?.tls_validation_record_value ||
															""
													)
											}}
										>
											<span className="mr-2 truncate  ">
												{domainData?.tls_validation_record_value}
											</span>
											{clipboard.copied &&
											clicked === domainData?.tls_validation_record_value ? (
												<IoCheckmark className="w-3 h-3" />
											) : (
												<IoCopy className="w-3 h-3" />
											)}
										</div>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2  text-sm gap-4 mb-4 ">
								<div className="truncate">
									name
									<div className="bg-white p-1 ">
										<div
											className="text-xs flex items-center justify-between cursor-pointer hover:text-cyan-800"
											onClick={() => {
												clipboard.copy(domainData?.external_domain),
													setClicked(domainData?.external_domain || "")
											}}
										>
											<span className="mr-2 truncate  ">
												{domainData?.external_domain}
											</span>
											{clipboard.copied &&
											clicked === domainData?.external_domain ? (
												<IoCheckmark className="w-3 h-3" />
											) : (
												<IoCopy className="w-3 h-3" />
											)}
										</div>
									</div>
								</div>
								<div className="truncate">
									value
									<div className="bg-white p-1 ">
										<div
											className="text-xs flex items-center justify-between cursor-pointer hover:text-cyan-800"
											onClick={() => {
												clipboard.copy(
													`${domainData?.internal_domain}.web.dotenx.com`
												),
													setClicked(
														`${domainData?.internal_domain}.web.dotenx.com` ||
															""
													)
											}}
										>
											<span className="mr-2 truncate  ">
												{domainData?.internal_domain}.web.dotenx.com
											</span>
											{clipboard.copied &&
											clicked ===
												`${domainData?.internal_domain}.web.dotenx.com` ? (
												<IoCheckmark className="w-3 h-3" />
											) : (
												<IoCopy className="w-3 h-3" />
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
						<Button
							type="button"
							loading={isLoading}
							onClick={() => mutate({ projectTag })}
							className="float-right"
						>
							Verify
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}

const AddDomain = ({ projectTag }: { projectTag: string }) => {
	const client = useQueryClient()
	const schema = z.object({
		externalDomain: z
			.string()
			.regex(/^[a-zA-Z0-9]*[a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
				message: "Please add a valid domain.",
			}),
	})
	const { onSubmit, ...form } = useForm({
		validate: zodResolver(schema),
	})
	const { mutate, isLoading } = useMutation(addDomain, {
		onSuccess: () => client.invalidateQueries([QueryKey.GetDomains]),
		onError: (e: any) => {
			toast(e.response.data.message || "Something went wrong!", {
				type: "error",
				autoClose: 2000,
			})
		},
	})
	return (
		<div className="font-medium border-2  rounded-md p-3 bg-white">
			<p className="my-2 ">You have not added any domains yet.</p>
			<form
				onSubmit={onSubmit((domainName) =>
					mutate({ projectTag: projectTag, domainName: domainName })
				)}
			>
				<TextInput
					label="Add your domain"
					type="text"
					required
					placeholder="www.example.com"
					className="pt-1 pb-2"
					{...form.getInputProps("externalDomain")}
				/>
				<div className="flex justify-end">
					<Button loading={isLoading} type="submit">
						Add
					</Button>
				</div>
			</form>
		</div>
	)
}
