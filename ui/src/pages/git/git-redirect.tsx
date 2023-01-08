import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { IoMdAlert } from 'react-icons/io'
import { ContentWrapper } from '../../features/ui'

export default function GitRedirectPage() {
	const [searchParams] = useSearchParams({ error: '' })

	useEffect(() => {
		const error = searchParams.get('error')
		if (!error) {
			return window.close()
		} else {
			setTimeout(() => {
				window.close()
			}, 5000)
		}
	}, [searchParams])

	return (
		<ContentWrapper>
			<div className="rounded-md mx-auto bg-rose-600 w-fit  mt-48 text-white flex items-center justify-center p-10 px-16 font-medium gap-2">
				<IoMdAlert className="w-7 h-7" />
				<div>Something went wrong! please try again later.</div>
			</div>
		</ContentWrapper>
	)
}
