import { useViewportSize } from "@mantine/hooks";
import { useEffect, useState } from "react";

const useScreenSize = () => {
    const { width } = useViewportSize()
    //   @media (min-width: 640px) {
    //     .tablet\:text-center { text-align: center }
    //   }

    //   @media (min-width: 1024px) {
    //     .laptop\:text-center { text-align: center }
    //   }

    //   @media (min-width: 1280px) {
    //     .desktop\:text-center { text-align: center }
    //   }
    const [screenSize, setScreenSize] = useState('desktop')
    useEffect(() => {
        if (width < 640) { setScreenSize('mobile') }
        else if (width >= 640 && width < 1024) { setScreenSize('tablet') }
        else { setScreenSize('desktop') }
    }, [width])


    return screenSize
}

export default useScreenSize;