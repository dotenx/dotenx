import { createEmotionCache, MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { useEffect } from "react"
import ReactModal from "react-modal"
import { QueryClient, QueryClientProvider } from "react-query"
import { BrowserRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Routes } from "./routes"

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

const emotionCache = createEmotionCache({ key: "mantine" })

export function App() {
	useEffect(() => {
		ReactModal.setAppElement("#root")
	}, [])

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<MantineProvider
					theme={{
						colors: {
							rose: [
								"#fff1f2",
								"#ffe4e6",
								"#fecdd3",
								"#fda4af",
								"#fb7185",
								"#f43f5e",
								"#e11d48",
								"#be123c",
								"#9f1239",
								"#881337",
							],
							lightRed: ["#ef233c"],
							darkRed: ["#d90429"],
							light: ["#edf2f4"],
							gray: ["#8d99ae"],
							dark: ["#2b2d42"],
						},
						primaryColor: "rose",
						fontFamily: "Inter, sans-serif",
						fontFamilyMonospace: "'Roboto Mono', monospace",
						headings: { fontFamily: "Inter, sans-serif" },
					}}
					emotionCache={emotionCache}
				>
					<ModalsProvider>
						<Routes />
						<ToastContainer />
					</ModalsProvider>
				</MantineProvider>
			</QueryClientProvider>
		</BrowserRouter>
	)
}
