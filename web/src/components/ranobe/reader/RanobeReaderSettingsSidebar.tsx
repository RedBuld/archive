import { useContext } from 'react'
import { DefaultReaderSettings } from '@/types/reader'
import { ReaderContext } from '@/contexts/ReaderContext'
import Tabs from '@/components/ui/Tabs'
import RangeInputSingle from '@/components/ui/RangeInputSingle'

export default function RanobeReaderSettingsSidebar()
{
    const readerContext = useContext( ReaderContext )

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

    let show_images_tabs = [
        {
            'key': 'yes',
            'name': 'Отображать'
        },
        {
            'key': 'no',
            'name': 'Скрыть'
        },
    ]

    let columns_tabs = [
        {
            'key': '1',
            'name': '1'
        },
        {
            'key': '2',
            'name': '2'
        },
    ]

    let text_align_tabs = [
        {
            'key': 'start',
            'name': 'По краю'
        },
        {
            'key': 'justify',
            'name': 'По ширине'
        },
    ]

    let text_indent_tabs = [
        {
            'key': 'yes',
            'name': 'Включить'
        },
        {
            'key': 'no',
            'name': 'Выключить'
        },
    ]

    function resetSettings()
    {
        readerContext.setSettings( {
            ...readerContext.settings.value,
            ranobe: { ...DefaultReaderSettings.ranobe }
        } )
    }

    function setSettings( key: string, value: string )
    {
        readerContext.setSettings( {
            ...readerContext.settings.value,
            ranobe: { ...readerContext.settings.value.ranobe, [key]:value }
        } )
    }

    function setReadMode(mode: string)
    {
        setSettings( 'mode', mode )
    }

    function setDirection( direction: string )
    {
        setSettings( 'direction', direction )
    }

    function setColumns( columns: string )
    {
        setSettings( 'columns', columns )
    }

    function setFontSize( size: string )
    {
        setSettings( 'font_size', size )
    }

    function setLineHeight( height: string )
    {
        setSettings( 'line_height', height )
    }

    function setLineGap( gap: string )
    {
        setSettings( 'line_gap', gap )
    }

    function setImages( images: string )
    {
        setSettings( 'show_images', images )
    }

    function setTextAlign( align: string )
    {
        setSettings( 'text_align', align )
    }

    function setTextIndent( indent: string )
    {
        setSettings( 'text_indent', indent )
    }

    return (
        <div className="flex flex-col gap-y-8 p-4">

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Режим чтения</div>
                <Tabs tabs={read_mode_tabs} active={readerContext.settings.value.ranobe.mode} callback={ (v: string) => setReadMode(v) } />
            </div>

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Направление управления</div>
                <Tabs tabs={direction_tabs} active={readerContext.settings.value.ranobe.direction} callback={ (v: string) => setDirection(v) } />
                <div className="flex flex-col text-sm text-white/50 mt-2 p-2 rounded-md bg-zinc-100/5">
                    <p>Слева направо - Следующая страница справа</p>
                    <p>Справа налево - Следующая страница слева</p>
                </div>
            </div>

            { ( readerContext.settings.value.ranobe.mode == 'pages' ) ? (
            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Кол-во страниц</div>
                <Tabs tabs={columns_tabs} active={readerContext.settings.value.ranobe.columns} callback={setColumns} />
                <div className="flex flex-col text-sm text-white/50 mt-2 p-2 rounded-md bg-zinc-100/5">
                    <p>При ширине страницы меньше 1000px - всегда 1 страница</p>
                </div>
            </div>
            ) : (<></>)}

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Выравнивание текста</div>
                <Tabs tabs={text_align_tabs} active={readerContext.settings.value.ranobe.text_align} callback={ (v: string) => setTextAlign(v) } />
            </div>

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Красная строка</div>
                <Tabs tabs={text_indent_tabs} active={readerContext.settings.value.ranobe.text_indent} callback={ (v: string) => setTextIndent(v) } />
            </div>

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Размер текста: <span className="inline-block ml-1 p-1 rounded-md bg-zinc-100/5">{parseInt(readerContext.settings.value.ranobe.font_size)}px</span></div>
                <RangeInputSingle
                    id='settings.ranobe.font_size'
                    min={10}
                    max={100}
                    step={1}
                    value={readerContext.settings.value.ranobe.font_size}
                    callback={ (v: string) => setFontSize(v) }
                />
            </div>

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Высота строки: <span className="inline-block ml-1 p-1 rounded-md bg-zinc-100/5">{parseFloat(readerContext.settings.value.ranobe.line_height).toFixed(1)}</span></div>
                <RangeInputSingle
                    id='settings.ranobe.line_height'
                    min={1.0}
                    max={3.0}
                    step={0.1}
                    value={readerContext.settings.value.ranobe.line_height}
                    callback={ (v: string) => setLineHeight(v) }
                />
            </div>
            
            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Расстояние между абзацами: <span className="inline-block ml-1 p-1 rounded-md bg-zinc-100/5">{parseInt(readerContext.settings.value.ranobe.line_gap)}px</span></div>
                <RangeInputSingle
                    id='settings.ranobe.line_gap'
                    min={0}
                    max={30}
                    step={1}
                    value={readerContext.settings.value.ranobe.line_gap}
                    callback={ (v: string) => setLineGap(v) }
                />
            </div>

            <div className="flex flex-col w-full">
                <div className="flex text-base text-white/80 mb-2 items-center">Показывать изображения</div>
                <Tabs tabs={show_images_tabs} active={readerContext.settings.value.ranobe.show_images} callback={ (v: string) => setImages(v) } />
            </div>

            <div className="flex flex-col w-full">
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