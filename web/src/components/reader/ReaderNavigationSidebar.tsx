import { ReactNode, useContext, useEffect } from 'react'
import { Scrollbar } from 'react-scrollbars-custom'
import { ReaderContext, ReaderNavigationContext } from '@/contexts/ReaderContext'
import { Close } from "@/icons"

export default function ReaderNavigationSidebar({
    children
} : {
    children: ReactNode
})
{
    const readerContext = useContext( ReaderContext )
    const readerNavigationContext = useContext( ReaderNavigationContext )

    const visible = readerContext.navigationSidebarVisible.value

    useEffect(
        () => {
            if( visible && readerNavigationContext.activeLinkRef?.current )
            {
                readerNavigationContext.setScrollTop( readerNavigationContext.activeLinkRef.current.offsetTop - window.innerHeight/2 )
            }
        },
        [ visible ]
    )

    return (
        <>
            <div className={`fixed left-0 top-0 z-[5] flex flex-col w-screen sm:w-96 h-screen overflow-hidden bg-zinc-900 group transition-transform duration-300 ${visible ? '-translate-x-0 shadow-md' : '-translate-x-full shadow-none'}`}>
                <div className="flex flex-row h-[var(--reader-header-height)] items-center justify-between gap-3 bg-zinc-900 shadow-md">
                    <span className="p-3 text-lg text-white/80 font-medium">Оглавление</span>
                    <button
                        onClick={ () => { readerContext.hideNavigationSidebar() }}
                        className="p-3 hover:bg-white/5 cursor-pointer"
                    >
                        <span className="inline-flex w-6 h-6 text-white/80">
                            <Close />
                        </span>
                    </button>
                </div>
                <Scrollbar
                    scrollTop={readerNavigationContext.scrollTop}
                    disableTracksWidthCompensation={true}
                    trackYProps={{
                        renderer: (props) => {
                            const { elementRef, ...restProps } = props;
                            let modRestProps = restProps??{}
                            const key = modRestProps['key']
                            delete modRestProps['key']
                            modRestProps['style'] && delete modRestProps['style']['background']
                            return <div key={key} {...modRestProps} ref={elementRef} />;
                        },
                    }}
                    thumbYProps={{
                        renderer: (props) => {
                            const { elementRef, ...restProps } = props;
                            let modRestProps = restProps??{}
                            const key = modRestProps['key']
                            delete modRestProps['key']
                            modRestProps['style'] && delete modRestProps['style']['background']
                            modRestProps['className'] += ' group-hover:bg-gray-600/80'
                            return <div key={key} {...modRestProps} ref={elementRef} />;
                        },
                    }}
                >
                    <div className="flex flex-col">
                        {children}
                    </div>
                </Scrollbar>
            </div>
            <div
                onClick={ () => { readerContext.hideNavigationSidebar() }}
                className={`fixed z-[4] top-0 left-0 w-screen h-screen bg-black/60 duration-300 transition-opacity ${visible ? 'opacity-100': 'opacity-0 pointer-events-none'}`}
            ></div>
        </>
    )
}