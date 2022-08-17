export enum QueryKey {
    GetProject = 'get-project',
    GetPages = 'get-pages',
    GetPageDetails = 'get-page-details',
}


export interface GetPagesResponse {
    name: string[]
}

export type GetProjectResponse = Project & { tag: string }

export interface Project {
    name: string
    description: string
}