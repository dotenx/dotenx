import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { addPage, GetPageDetails, getPages, QueryKey } from '../api/page.service'

export const usePages = (projectTag: string) => {
    const [pagesList, setPagesList] = useState([])
    const { isLoading: pagesListLoading } = useQuery([QueryKey.GetPages, projectTag], () => getPages({ tag: projectTag }),
        { onSuccess: (data) => { setPagesList(data?.data) }, enabled: !!projectTag }
    )
    const [pageName, setPageName] = useState('')

    const pageDetailsQuery = useQuery([QueryKey.GetPageDetails, pageName], () => GetPageDetails({ tag: projectTag, pageName }),
        { enabled: !!pageName }
    )

    const { mutate: addPageMutate } = useMutation((payload: { name: string }) => addPage({ tag: projectTag, name: payload.name }))

    return { pageName, pagesList, pagesListLoading, setPageName, addPageMutate }
}
