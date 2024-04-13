import { Button, Select, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "react-toastify"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, Navigate } from "react-router-dom"
import { GetDomainResponse, QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { addDomain, getDomains, verifyDomain } from "../api"
import { ContentWrapper, Header } from "../features/ui/header"
import { IoCheckmark, IoCopy } from "react-icons/io5"
import { TypeOf, z } from "zod"
import { Loader } from "../features/ui/loader"
import { useClipboard } from "@mantine/hooks"
import useScreenSize from "../features/hooks/use-screen-size"
import { FaChevronRight, FaStripe } from "react-icons/fa"

export function DomainsPage() {
	const { projectTag, projectName, isLoading: projectTagisLoading } = useGetProjectTag()
	const [isDomainAdded, setIsDomainAdded] = useState<boolean>()

	const getDomainsQuery = useQuery(
		[QueryKey.GetDomains, projectTag],
		() => getDomains(projectTag),
		{
			enabled: !!projectTag,
			onSuccess: (data: any) => {
				if (data.data.external_domain) setIsDomainAdded(true)
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
				<div className={`${smallScreen ? " " : "px-20 max-w-4xl"} mx-auto py-10    `}>
					{getDomainsQuery.isLoading ||
					projectTagisLoading ||
					getDomainsQuery.isRefetching ? (
						<Loader className="mx-auto mt-16" />
					) : (
						<div>
							{isDomainAdded ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ type: "spring", duration: 0.7 }}
								>
									<Domain
										projectTag={projectTag}
										domainData={getDomainsQuery?.data?.data}
									/>
								</motion.div>
							) : (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ type: "spring", duration: 0.7 }}
								>
									<NoDomain />
								</motion.div>
							)}
						</div>
					)}
				</div>
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
	console.log(domainData, "domainData")
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
				{domainData && domainData.certificate_issued ? (
					<span className="float-right font-medium text-green-500">verified</span>
				) : (
					<div>
						<div className=" border p-2 rounded-md bg-gray-50 mb-2">
							<span className="font-semibold">
								Please add these name server records to your domain’s DNS.
							</span>
							<div className="text-sm">If you need help contact support.</div>
							<div className="grid grid-cols-2  text-sm gap-4 my-4">
								{domainData?.nameservers.map((ns) => (
									<div className="truncate">
										<div className="bg-white p-1 ">
											<div
												className="text-xs flex items-center justify-between cursor-pointer hover:text-cyan-800"
												onClick={() => {
													clipboard.copy(ns), setClicked(ns || "")
												}}
											>
												<span className="mr-2 truncate  ">{ns}</span>
												{clipboard.copied && clicked === ns ? (
													<IoCheckmark className="w-3 h-3" />
												) : (
													<IoCopy className="w-3 h-3" />
												)}
											</div>
										</div>
									</div>
								))}
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

const NoDomain = () => {
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
	return (
		<div
			className={`${
				smallScreen ? "p-3" : "p-5"
			} font-medium border-2  rounded-md p-3 bg-white`}
		>
			<h1 className="my-2 text-2xl">You have not added any domains yet.</h1>
			<p className="my-2 ">
				If you don’t have a domain, you can purchase one. Alternatively, if you already have
				a domain, you can add it here.
			</p>

			<div className="flex gap-4 justify-end mt-8">
				<Button component={Link} to="register" variant={"default"}>
					Add Domain
				</Button>
				<Button component={Link} to="purchase">
					Purchase Domain
				</Button>
			</div>
		</div>
	)
}
