import { createContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { batch, useSignal, useSignalEffect } from '@preact/signals-react'
import { ReaderContextType, ReaderNavigationContextType, ReaderSettings } from '@/types/reader'
import { getReaderSettings, setReaderSettings } from '@/api/reader'

export const ReaderContext = createContext<ReaderContextType>(null!)
export const ReaderNavigationContext = createContext<ReaderNavigationContextType>(null!)


export function ReaderContextProvider(props: any)
{
    const navigate = useNavigate()
    // 
    const header = useRef<HTMLDivElement>(null!)
    const footer = useRef<HTMLDivElement>(null!)
    const progress = useRef<SVGSVGElement>(null!)
    // 
    const isBackward = useRef<boolean>(false)
    // 
    const headerVisible = useSignal<boolean>(false)
    const footerVisible = useSignal<boolean>(false)
    const manuallyToggledHF = useSignal<boolean>(false)
    // 
    const navigationSidebarVisible = useSignal<boolean>(false)
    const settingsSidebarVisible = useSignal<boolean>(false)
    const anySidebarVisible = useSignal<boolean>(false)
    // 
    const nowLoading = useSignal<boolean>(true)
    const firstLoadingDone = useSignal<boolean>(false)
    // 
    const settings = useSignal<ReaderSettings>( getReaderSettings() )

    // 
    const currentProductLink = useSignal<string>('')
    const currentProductName = useSignal<string>('')
    const currentProductEngName = useSignal<string>('')
    // 
    const navigationPrevLink = useSignal<string>('')
    const navigationNextLink = useSignal<string>('')
    // 
    const currentVolumeNumber = useSignal<number>(0)
    const currentChapterNumber = useSignal<number>(0)
    const currentPositionText = useSignal<string>('')

    // 

    function updateLoadingProgress(loaded: number, total: number)
    {
        if( progress.current )
        {
            let percent = Math.round(loaded * 100 / total)
            progress.current.style.setProperty('--progress',`${percent}`)
        }
    }

    function toTop()
    {
        document.documentElement.scrollTop = header.current?.clientHeight ?? 48
    }

    // 

    function showHeader()
    {
        headerVisible.value = true
    }

    function hideHeader()
    {
        headerVisible.value = false
    }

    // 

    function showFooter()
    {
        footerVisible.value = true
    }

    function hideFooter()
    {
        footerVisible.value = false
    }

    // 

    function setManuallyToggledHF( v: boolean )
    {
        manuallyToggledHF.value = v
    }

    // 

    function showNavigationSidebar()
    {
        navigationSidebarVisible.value = true
    }

    function hideNavigationSidebar()
    {
        navigationSidebarVisible.value = false
    }

    // 

    function showSettingsSidebar()
    {
        settingsSidebarVisible.value = true
    }

    function hideSettingsSidebar()
    {
        settingsSidebarVisible.value = false
    }

    // 

    function toggleHeaderFooter()
    {
        let state = !( headerVisible.value && footerVisible.value )
        batch( () => {
            manuallyToggledHF.value = state
            headerVisible.value = state
            footerVisible.value = state
        })
    }

    function showHeaderFooter()
    {
        showHeader()
        showFooter()
    }

    function hideHeaderFooter()
    {
        hideHeader()
        hideFooter()
    }

    // 

    function setNowLoading( v: boolean )
    {
        nowLoading.value = v
    }

    function setFirstLoadingDone( v: boolean )
    {
        firstLoadingDone.value = v
    }

    // 

    function setSettings( v: any )
    {
        settings.value = v
    }

    // 

    function setCurrentProductLink( v: string )
    {
        currentProductLink.value = v
    }

    function setCurrentProductName( v: string )
    {
        currentProductName.value = v
    }

    function setCurrentProductEngName( v: string )
    {
        currentProductEngName.value = v
    }

    // 

    function setNavigationPrevLink( v: string )
    {
        navigationPrevLink.value = v
    }

    function setNavigationNextLink( v: string )
    {
        navigationNextLink.value = v
    }

    // 

    function setCurrentVolumeNumber( v: number )
    {
        currentVolumeNumber.value = v
    }

    function setCurrentChapterNumber( v: number )
    {
        currentChapterNumber.value = v
    }

    function setCurrentPositionText( v: string )
    {
        currentPositionText.value = v
    }

    // 

    function setIsBackward( v: boolean )
    {
        isBackward.current = v
    }

    function moveToNextChapter()
    {
        if( navigationNextLink.value )
        {
            setNowLoading( true )
            hideNavigationSidebar()
            navigate( navigationNextLink.value )
            toTop()
        }
    }
    
    function moveToPrevChapter()
    {
        if( navigationPrevLink.value )
        {
            setNowLoading( true )
            hideNavigationSidebar()
            navigate( navigationPrevLink.value )
            toTop()
        }
    }

    function moveToChapter( link: string )
    {
        if( link )
        {
            setNowLoading( true )
            hideNavigationSidebar()
            navigate( link )
            toTop()
        }
    }


    const readerContext: ReaderContextType = {
        header: header,
        footer: footer,
        progress: progress,
        // 
        updateLoadingProgress: updateLoadingProgress,
        toTop: toTop,
        // 
        headerVisible: headerVisible, showHeader: showHeader, hideHeader: hideHeader,
        footerVisible: footerVisible, showFooter: showFooter, hideFooter: hideFooter,
        manuallyToggledHF: manuallyToggledHF, setManuallyToggledHF: setManuallyToggledHF,
        // 
        navigationSidebarVisible: navigationSidebarVisible, showNavigationSidebar: showNavigationSidebar, hideNavigationSidebar: hideNavigationSidebar,
        settingsSidebarVisible: settingsSidebarVisible, showSettingsSidebar: showSettingsSidebar, hideSettingsSidebar: hideSettingsSidebar,
        anySidebarVisible: anySidebarVisible,
        // 
        toggleHeaderFooter: toggleHeaderFooter,
        showHeaderFooter: showHeaderFooter,
        hideHeaderFooter: hideHeaderFooter,
        // 
        nowLoading: nowLoading, setNowLoading: setNowLoading,
        firstLoadingDone: firstLoadingDone, setFirstLoadingDone: setFirstLoadingDone,
        // 
        settings: settings, setSettings: setSettings,
        // 
        currentProductLink: currentProductLink, setCurrentProductLink: setCurrentProductLink,
        currentProductName: currentProductName, setCurrentProductName: setCurrentProductName,
        currentProductEngName: currentProductEngName, setCurrentProductEngName: setCurrentProductEngName,
        //
        navigationPrevLink: navigationPrevLink, setNavigationPrevLink: setNavigationPrevLink,
        navigationNextLink: navigationNextLink, setNavigationNextLink: setNavigationNextLink,
        // 
        currentVolumeNumber: currentVolumeNumber, setCurrentVolumeNumber: setCurrentVolumeNumber,
        currentChapterNumber: currentChapterNumber, setCurrentChapterNumber: setCurrentChapterNumber,
        currentPositionText: currentPositionText, setCurrentPositionText: setCurrentPositionText,
        //
        isBackward: isBackward, setIsBackward: setIsBackward,
        moveToNextChapter: moveToNextChapter,
        moveToPrevChapter: moveToPrevChapter,
        moveToChapter: moveToChapter,
    }

    useSignalEffect(
        () => {
            anySidebarVisible.value = navigationSidebarVisible.value || settingsSidebarVisible.value
        }
    )

    useSignalEffect(
        () => {
            setReaderSettings( settings.value )
        }
    )

    return (
        <ReaderContext.Provider value={readerContext}>
            {props.children}
        </ReaderContext.Provider>
    )
}

export function ReaderNavigationContextProvider(props: any)
{
    const activeLinkRef = useRef<HTMLAnchorElement>(null!)
    const [scrollTop, setScrollTop] = useState<number>(0)

    const readerNavigationContext: ReaderNavigationContextType = {
        activeLinkRef: activeLinkRef,
        scrollTop: scrollTop, setScrollTop: setScrollTop
    }

    return (
        <ReaderNavigationContext.Provider value={readerNavigationContext}>
            {props.children}
        </ReaderNavigationContext.Provider>
    )
}