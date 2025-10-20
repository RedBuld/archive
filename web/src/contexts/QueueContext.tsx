import { createContext, useEffect, useRef, useState } from 'react'
import { saveFile } from '../tools/files'

export interface QueueContextType{
    queue: QueueTask[]
    addToQueue: Function
}

export interface QueueTask{
    name: string
    url: string
}

export const QueueContext = createContext<QueueContextType>(null!)

export function QueueContextProvider(props: any)
{
    const progressRef = useRef<HTMLDivElement|null>(null)
    const controller = useRef<AbortController>(new AbortController())
  
    const [open, setOpen] = useState<boolean>(true)

    const [queue,setQueue] = useState<QueueTask[]>([])
    const [downloading, setDownloading] = useState<boolean>(false)

    function addToQueue(task: QueueTask)
    {
        if( import.meta.env.MODE == 'development' )
        {
            task.url = task.url.replace('https://archive.e2bot.online/','http://localhost:5173/')
        }

        let _queue = queue
        _queue.push(task)
        setQueue( [..._queue] )
    }

    function taskStart()
    {
        if( queue.length > 0 && !downloading )
        {
            updateProgress(0,1)
            setDownloading(true)
            controller.current = new AbortController()
            const task = queue[0]
            saveFile( task.url, task.name, updateProgress, controller.current.signal ).then( taskDone )
        }
    }

    function taskCancel(index: number)
    {
        if( index == 0 )
        {
            controller.current.abort('Cancel')
            updateProgress(0,1)
        }
        else
        {
            let _queue = queue
            _queue.splice(index,1)
            setQueue( [..._queue] )
        }
    }

    function taskDone()
    {
        setDownloading(false)
    }
    
    function getScrollbarWidth()
    {
        const outer = document.createElement('div')
        outer.style.visibility = 'hidden'
        outer.style.overflow = 'scroll'
        document.body.appendChild(outer)
        
        const inner = document.createElement('div')
        outer.appendChild(inner)
        
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth)
        
        document.body.removeChild(outer)
        return scrollbarWidth
    }
    
    function updateProgress(loaded: number, total: number)
    {
        if( progressRef.current )
        {
            let percent = Math.round(loaded * 100 / total)
            progressRef.current.style.backgroundImage = `linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) ${percent}%, rgba(255,255,255,0) ${percent}%, rgba(255,255,255,0) 100%)`
        }
    }

    const queueContext = {
        queue: queue,
        addToQueue: addToQueue
    }

    useEffect(
        () => {
            taskStart()
        },
        [queue]
    )

    useEffect(
        () => {
            if( !downloading )
            {
                let _queue = queue
                _queue.splice(0,1)
                setQueue( [..._queue] )
            }
        },
        [downloading]
    )
  
    return (
        <>
            <QueueContext.Provider value={queueContext}>
                {props.children}
            </QueueContext.Provider>
            <div className={`${queue.length>0?'flex':'hidden'} flex-col fixed z-50 right-0 bottom-0 bg-zinc-800/95 backdrop-blur shadow-lg overflow-hidden rounded-tl-md`}>
                <div className="flex flex-row items-center p-3 gap-3 bg-zinc-700/80 shadow-md" onClick={ () => {setOpen(!open)}}>
                    <span className="text-white/80 text-md font-medium">Очередь загрузок</span>
                </div>
                <div className={`flex flex-col overflow-hidden transition-max-h duration-700 ${open?'max-h-[60vh]':'max-h-[0px]'}`} >
                    <div className="max-w-[min(60rem,100vw)] max-h-full divide-y divide-white/5 box-border overflow-x-hidden overflow-y-scroll" style={{'marginRight':`-${getScrollbarWidth()}px`}}>
                        { queue.map( (task,index) => (
                        <div key={`dqt_${index}`} className="download-queue-task grid w-full items-center">
                            <div style={{'gridArea':'name'}} className="inline-flex p-3 pl-4">
                                <span className="text-white text-sm">{task.name}</span>
                            </div>
                            <div style={{'gridArea':'progress'}} className="inline-flex p-3">
                                <div className="inline-flex w-full h-3 rounded-full bg-white/20" ref={index == 0 ? progressRef : null}></div>
                            </div>
                            <div style={{'gridArea':'cancel'}} className="inline-flex p-3 pr-4">
                                <span className="inline-flex w-5 h-5 text-white/80 hover:text-white cursor-pointer" onClick={ () => taskCancel(index) }>
                                    <svg className="inline-flex w-full h-full text-inherit pointer-events-none fill-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M18 18L6 6" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                        ) ) }
                    </div>
                </div>
            </div>
        </>
    )
}