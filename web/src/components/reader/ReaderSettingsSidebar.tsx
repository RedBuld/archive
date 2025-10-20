import { ReactNode, useContext } from 'react'
import { Scrollbar } from 'react-scrollbars-custom'
import { ReaderContext } from '@/contexts/ReaderContext'
import { Close } from "@/icons"

export default function ReaderSettingsSidebar({
    children
} : {
    children: ReactNode
})
{
    const readerContext = useContext( ReaderContext )

    const visible = readerContext.settingsSidebarVisible.value

    return (
        <>
            <div className={`fixed right-0 top-0 z-[5] flex flex-col w-screen sm:w-96 h-screen overflow-hidden bg-zinc-900 group transition-transform duration-300 ${visible ? 'translate-x-0 shadow-md' : 'translate-x-full shadow-none'}`}>
                <div className="flex flex-row h-[var(--reader-header-height)] justify-between gap-3 bg-zinc-900 shadow-md">
                    <span className="p-3 text-lg text-white/80 font-medium">Настройки</span>
                    <button
                        onClick={ () => { readerContext.hideSettingsSidebar() }}
                        className="p-3 hover:bg-white/5 cursor-pointer"
                    >
                        <span className="inline-flex w-6 h-6 text-white/80">
                            <Close />
                        </span>
                    </button>
                </div>
                <Scrollbar
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
                            modRestProps['className'] += ' group-hover:bg-sky-600/80'
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
                onClick={ () => { readerContext.hideSettingsSidebar() }}
                className={`fixed z-[4] top-0 left-0 w-screen h-screen bg-black/60 duration-300 transition-opacity ${visible ? 'opacity-100': 'opacity-0 pointer-events-none'}`}
            ></div>
        </>
    )
}