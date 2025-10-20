import { useContext } from 'react'
import { DefaultReaderSettings } from '@/types/reader'
import { ReaderContext } from '@/contexts/ReaderContext'
import Tabs from '@/components/ui/Tabs'

export default function MangaReaderSettingsSidebar()
{
    const readerContext = useContext(ReaderContext)

    let read_mode_tabs = [
        {
            'key': 'pages',
            'name': 'Постранично'
        },
        {
            'key': 'flow',
            'name': 'Вертикально'
        }
    ]

    let direction_tabs = [
        {
            'key': 'ltr',
            'name': 'Слева направо'
        },
        {
            'key': 'rtl',
            'name': 'Справа налево'
        },
    ]

    let fit_tabs = [
        {
            'key': 'width',
            'name': 'По ширине'
        },
        {
            'key': 'height',
            'name': 'По высоте экрана'
        },
    ]

    let gap_tabs = [ { 'key': '0', 'name': '0' }, { 'key': '1', 'name': '1' }, { 'key': '2', 'name': '2' }, { 'key': '3', 'name': '3' }, { 'key': '4', 'name': '4' }, { 'key': '5', 'name': '5' }, { 'key': '6', 'name': '6' }, ]
    
    function resetSettings()
    {
        readerContext.setSettings( {
            ...readerContext.settings.value,
            manga: { ...DefaultReaderSettings.manga }
        } )
    }

    function setSettings( key: string, value: string )
    {
        readerContext.setSettings( {
            ...readerContext.settings.value,
            manga: { ...readerContext.settings.value.manga, [key]:value }
        } )
    }

    function setReadMode( mode: string )
    {
        setSettings( 'mode', mode )
    }

    function setDirection( direction: string )
    {
        setSettings( 'direction', direction )
    }

    function setGap( gap: string )
    {
        setSettings( 'gap', gap )
    }

    function setFit( fit: string )
    {
        setSettings( 'fit', fit )
    }

    return (

        <div className="flex flex-col gap-y-8 p-4">

            <div className="flex flex-col">
                <div className="flex text-base text-white/80 mb-2 items-center">Режим чтения</div>
                <Tabs tabs={read_mode_tabs} active={readerContext.settings.value.manga.mode} callback={setReadMode} />
            </div>

            <div className="flex flex-col">
                <div className="flex text-base text-white/80 mb-2 items-center">Направление управления</div>
                <Tabs tabs={direction_tabs} active={readerContext.settings.value.manga.direction} callback={setDirection} />
                <div className="flex flex-col text-sm text-white/50 mt-2 p-2 rounded-md bg-zinc-100/5">
                    <p>Слева направо - Следующая страница справа</p>
                    <p>Справа налево - Следующая страница слева</p>
                </div>
            </div>

            { readerContext.settings.value.manga.mode == 'flow' ? (
            <div className="flex flex-col">
                <div className="flex text-base text-white/80 mb-2 items-center">Зазор между картинками</div>
                <Tabs tabs={gap_tabs} active={readerContext.settings.value.manga.gap} callback={setGap} />
            </div>
            ) : (<></>)}

            <div className="flex flex-col">
                <div className="flex text-base text-white/80 mb-2 items-center">Вместить изображение</div>
                <Tabs tabs={fit_tabs} active={readerContext.settings.value.manga.fit} callback={setFit} />
            </div>

            <div className="flex flex-col">
                <button
                    onClick={ () => resetSettings() }
                    className="inline-flex box-content justify-center py-2 px-2 text-white bg-zinc-700 hover:bg-zinc-500 font-medium text-sm rounded-md cursor-pointer"
                > По умолчанию</button>
                <div className="flex flex-col text-sm text-white/50 mt-2 p-2 items-center rounded-md bg-zinc-100/5">
                    <p>Нажать при наличии ошибок</p>
                </div>
            </div>

        </div>
    )
}