import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
	const navigate = useNavigate()

	return (
		<main className="flex flex-col items-center p-20 text-center grow">
			<h1 className="font-thin text-9xl">404</h1>
			<h2 className="mt-6 text-5xl font-extralight">Not Found</h2>
			<button className="mt-10 font-black hover:underline" onClick={() => navigate(-1)}>
				Go Back
			</button>
		</main>
	)
}
