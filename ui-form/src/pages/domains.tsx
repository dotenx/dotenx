import { Button, Loader, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { useState } from "react"
import { toast } from "react-toastify"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Navigate } from "react-router-dom"
import { GetDomainResponse, QueryKey } from "../api/types"
import { useGetProjectTag } from "../features/hooks/use-project-query"
import { addDomain, getDomains, verifyDomain } from "../api"
import { ContentWrapper, Header } from "../features/ui/header"
import { z } from "zod"

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

	return (
		<div>
			<Header title={"Domains"} />
			<ContentWrapper>
				{getDomainsQuery.isLoading ||
				projectTagisLoading ||
				getDomainsQuery.isRefetching ? (
					<Loader className="mx-auto" />
				) : (
					<div className="mx-auto py-10  px-20 max-w-4xl ">
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
			<div className="p-3 text-left border-2 rounded-md bg-white ">
				<h1 className="font-semibold">Domain</h1>
				<a
					target={"_blank"}
					rel="noreferrer"
					href={"//" + domainData?.external_domain}
					className="text-lg transition-colors text-cyan-600 hover:text-cyan-500"
				>
					{domainData?.external_domain}
				</a>
				{domainData && !!domainData.cdn_arn ? (
					<span className="float-right font-medium text-green-500">verified</span>
				) : (
					<Button
						type="button"
						loading={isLoading}
						onClick={() => mutate({ projectTag })}
						className="float-right"
					>
						Verify
					</Button>
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
		<div className="font-medium border-2  rounded-[10px]  p-3 bg-white">
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
