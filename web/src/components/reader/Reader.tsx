import { useEffect, useContext, ReactNode } from 'react'
import { ReaderContext } from '@/contexts/ReaderContext'
import ReaderHeader from '@/components/reader/ReaderHeader'
import ReaderFooter from '@/components/reader/ReaderFooter'
import ReaderNavigationSidebar from '@/components/reader/ReaderNavigationSidebar'
import ReaderSettingsSidebar from '@/components/reader/ReaderSettingsSidebar'
import { CircularProgress } from "@/icons"
import { useSignal, useSignalEffect } from '@preact/signals-react'

// CONTROLS

export default function Reader({
    navigation,
    settings,
    children
} : {
    navigation: ReactNode,
    settings: ReactNode,
    children: ReactNode
})
{
    const readerContext = useContext( ReaderContext )

    const mouseNearHeader = useSignal<boolean>(false)
    const mouseNearFooter = useSignal<boolean>(false)
    const headerShowByScroll = useSignal<boolean>(false)
    const footerShowByScroll = useSignal<boolean>(false)

    const headerTriggerHeight = readerContext.header.current?.clientHeight ?? 48
    const footerTriggerHeight = readerContext.footer.current?.clientHeight ?? 48
    
    const detectScroll = () => {

        if( readerContext.anySidebarVisible.value ) return

        if( readerContext.manuallyToggledHF.value ) return

        headerShowByScroll.value = window.scrollY < headerTriggerHeight
        footerShowByScroll.value = window.scrollY > ( document.documentElement.scrollHeight - footerTriggerHeight )
    }
    
    const detectMouse = ( ev: MouseEvent ) =>  {

        if( readerContext.anySidebarVisible.value ) return

        if( readerContext.manuallyToggledHF.value ) return

        if( window.innerWidth < 640 )
        {
            mouseNearHeader.value = false
            mouseNearFooter.value = false
            return
        }

        mouseNearHeader.value = ev.clientY <= headerTriggerHeight
        mouseNearFooter.value = ev.clientY >= ( window.innerHeight - footerTriggerHeight )
    }
    // CONTROLS

    useSignalEffect(
        () => {
            if( readerContext.manuallyToggledHF.value ) return

            if( mouseNearHeader.value || headerShowByScroll.value )
            {
                readerContext.showHeader()
            }
            else
            {
                readerContext.hideHeader()
            }
            if( mouseNearFooter.value || footerShowByScroll.value )
            {
                readerContext.showFooter()
            }
            else
            {
                readerContext.hideFooter()
            }
        }
    )

    useSignalEffect(
        () => {
            readerContext.firstLoadingDone.value && readerContext.toTop()
        }
    )

    useEffect(
        () => {
            window.addEventListener('scroll', detectScroll)
            window.addEventListener('mousemove', detectMouse)
            return () => {
                window.removeEventListener('scroll', detectScroll)
                window.removeEventListener('mousemove', detectMouse)
            }
        },
        [ detectScroll, detectMouse ]
    )

    return (
        <div
            className="flex flex-col flex-grow w-full max-w-screen min-h-full"
        >
            <ReaderHeader headerRef={ readerContext.header }/>
            <ReaderNavigationSidebar>{navigation}</ReaderNavigationSidebar>
            <ReaderSettingsSidebar>{settings}</ReaderSettingsSidebar>
            <div className="flex flex-col w-full min-h-screen">
                { readerContext.nowLoading.value ? (
                <div className="fixed z-[2] bg-zinc-900/80 top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center backdrop-blur-xs">
                    <div className="inline-flex w-12 h-12">
                        <CircularProgress ref={ readerContext.progress }/>
                    </div>
                </div>
                ) : (<></>) }
                {children}
            </div>
            <ReaderFooter footerRef={ readerContext.footer } />
        </div>
    )
}