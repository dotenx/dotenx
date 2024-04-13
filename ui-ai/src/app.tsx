import { createEmotionCache, MantineProvider } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Routes } from "./features/app/routes"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

const emotionCache = createEmotionCache({ key: "mantine" })

export function App() {
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
						},
						primaryColor: "rose",
						fontFamily: "Inter, sans-serif",
						fontFamilyMonospace: "'Roboto Mono', monospace",
						headings: { fontFamily: "Inter, sans-serif" },
					}}
					emotionCache={emotionCache}
				>
					<Routes />
					<ToastContainer />
				</MantineProvider>
			</QueryClientProvider>
		</BrowserRouter>
	)
}
