export function toggleFullScreen() {
	if (!document.fullscreenElement) document.documentElement.requestFullscreen()
	else if (document.exitFullscreen) document.exitFullscreen()
}
