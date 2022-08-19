import axios from 'axios'
import {
    GetPagesResponse, GetProjectResponse,
} from './types'
export * from './types'

export const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

export function getPages({ tag }: { tag: string }) {
    return api.get<GetPagesResponse>(`/uibuilder/project/${tag}/page`)
}

export function GetPageDetails({ tag, pageName }: { tag: string, pageName: string }) {
    return api.get(`/uibuilder/project/${tag}/page/${pageName}`)
}

export function addPage({ tag, name }: { tag: string, name: string }) {
    return api.post(`/uibuilder/project/${tag}/page`, {
        name: name,
        content: {
            www: {
                y: [1, 2, 3],
                l: 'a'
            },
            z: 12
        }
    })

}

export function getProject(name: string) {
    return api.get<GetProjectResponse>(`/project/${name}`)
}