import { api } from './api'

export enum EcommerceQueryKey {
    GetProducts = 'get-products',
}

export function getTags({ projectTag }: { projectTag: string }) {
	return api.get<GetTagsResponse>(`/public/ecommerce/project/${projectTag}/product/tags`)
}

type GetTagsResponse = {
	rows: { tag: string }[]
	rows_affected: number
	successful: boolean
	total_rows: number
}
