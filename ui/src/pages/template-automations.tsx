import { IoArrowBack } from "react-icons/io5"
import { useQuery } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import { getTemplateAutomations, QueryKey } from "../api"
import { AutomationList } from "../features/automation"

export default function TemplateAutomationsPage() {
	const { name = "", projectName = "" } = useParams()
	const templateAutomationsQuery = useQuery(
		QueryKey.GetTemplateAutomations,
		() => getTemplateAutomations(name, projectName),
		{ enabled: !!(name && projectName) }
	)
	const navigate = useNavigate()
	return (
		<div className="w-full ">
			<div onClick={() => navigate(-1)} className="ml-52 mt-10 cursor-pointer">
				<IoArrowBack />
			</div>
			<AutomationList
				automations={templateAutomationsQuery?.data?.data}
				loading={templateAutomationsQuery.isLoading}
				title="Automations"
				subtitle={`Automations created for template ${name}`}
				kind="template_automations"
			/>
		</div>
	)
}
