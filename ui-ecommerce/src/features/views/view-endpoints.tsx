import { API_URL } from "../../api"
import { Endpoint } from "../ui"

export function ViewEndpoints({
	viewName,
	projectTag,
	isPublic,
}: {
	viewName: string
	projectTag: string
	isPublic: boolean
}) {
	return (
		<div className="space-y-8 ">
			<Endpoint
				label="Get records"
				url={
					isPublic
						? `${API_URL}/public/database/query/select/project/${projectTag}/view/${viewName}`
						: `${API_URL}/database/query/select/project/${projectTag}/view/${viewName}`
				}
				method="POST"
				code={{}}
			/>
		</div>
	)
}

//
