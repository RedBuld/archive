import { Book, BookMetadata, BodyWithSectionsIds, Section } from  "@/tools/fb2/types"
import { NS, MIME, ANNOTATION, BODY } from  "@/tools/fb2/consts"
import FB2Converter from "@/tools/fb2/converter"

function normalizeWhitespace( str: string|null|undefined )
{
    return str ? str.replace(/[\t\n\f\r ]+/g, ' ').replace(/^[\t\n\f\r ]+/, '').replace(/[\t\n\f\r ]+$/, '') : ''
}

function getElementText( el: Element|null )
{
    return normalizeWhitespace( el?.textContent )
}

async function parseXML( blob: Blob ): Promise<Document>
{
    const buffer = await blob.arrayBuffer()

    let content = new TextDecoder('utf-8').decode( buffer )

    const parser = new DOMParser()

    let xmlDoc = parser.parseFromString( content, MIME.XML as DOMParserSupportedType )

    const encoding = xmlDoc.characterSet || content.match(/^<\?xml\s+version\s*=\s*["']1.\d+"\s+encoding\s*=\s*["']([A-Za-z0-9._-]*)["']/)?.[1]

    if( encoding && encoding.toLowerCase() !== 'utf-8' )
    {
        content = new TextDecoder( encoding ).decode( buffer )
        xmlDoc = parser.parseFromString( content, MIME.XML as DOMParserSupportedType )
    }
    return xmlDoc
}


const template = ( html: string ) => `<html xmlns="${NS.XHTML}"><body>${html}</body></html>`

// name of custom ID attribute for TOC items
const dataID = 'data-foliate-id'

export async function parseFB2( blob: Blob )
{
    const doc = await parseXML( blob )

    const converter = new FB2Converter( doc )

    
    const idMap = new Map()
    const urls: string[] = []
    const book: Book = {
        metadata: {} as BookMetadata,
        sections: [],
        getCover: () => null,
        resolveHref: ( href: string ) => {
            const [ a, b ] = href.split('#')
            return a
                // the link is from the TOC
                ? { index: Number( a ), anchor: ( doc: Document ) => doc.querySelector( `[${dataID}="${b}"]` ) }
                // link from within the page
                : { index: idMap.get( b ), anchor: ( doc: Document ) => doc.getElementById( b ) }
        },
        destroy: () => {
            for( const url of urls )
            {
                URL.revokeObjectURL(url)
            }
        }
    }

    function $( x: string )
    {
        return doc.querySelector( x )
    }

    function $$( x: string )
    {
        return [ ...doc.querySelectorAll( x ) ]
    }

    function getPerson( el: Element )
    {
        const nick = getElementText( el.querySelector('nickname') )
        if( nick )
        {
            return nick
        }
        
        const first  = getElementText( el.querySelector('first-name') )
        const middle = getElementText( el.querySelector('middle-name') )
        const last   = getElementText( el.querySelector('last-name') )
        
        const name = [ first, middle, last ].filter( x => x ).join(' ')
        const sortAs = last ?
            [ last, [ first, middle ].filter(x => x).join(' ') ].join(', ') :
            null
        return { name, sortAs }
    }

    function getDate( el: Element|null )
    {
        return el?.getAttribute( 'value' ) ?? getElementText( el )
    }

    const annotation = $('title-info annotation')

    book.metadata = {
        title:       getElementText( $('title-info book-title') ),
        identifier:  getElementText( $('document-info id') ),
        language:    getElementText( $('title-info lang') ),
        author:      $$('title-info author').map( getPerson ),
        translator:  $$('title-info translator').map( getPerson ),
        contributor: $$('document-info author').map( getPerson )
            .concat( $$('document-info program-used').map( getElementText ) )
            .map(
                ( x ) => {
                    return Object.assign(
                        typeof x === 'string' ? { name: x } : x,
                        { role: 'bkp' }
                    )
                }
            ),
        publisher:   getElementText( $('publish-info publisher') ),
        published:   getDate( $('title-info date') ),
        modified:    getDate( $('document-info date') ),
        description: annotation ? converter.convert( annotation, ANNOTATION ).innerHTML : '',
        subject:     $$('title-info genre').map( getElementText ),
    }

    let cover = $('coverpage image')

    if( cover )
    {
        const src = converter.getImageSrc( cover )
        book.getCover = () => fetch( src ).then( res => res.blob() )
    }

    // get convert each body
    const bodiesData: BodyWithSectionsIds[] = Array.from(
        doc.querySelectorAll('body'),
        ( body: Element ) => {
            const converted_body: any = converter.convert( body, { 'body': ['body', BODY] } )
            const sections_with_ids = Array.from(
                converted_body.children,
                ( el: Element ) => {
                    // get list of IDs in the section
                    const ids = [ el, ...el.querySelectorAll('[id]') ].map( el => el.id )
                    return {
                        el,
                        ids
                    }
                }
            )
            return [ sections_with_ids, converted_body ]
        }
    )

    let sectionsData: Section[] = []

    let main_body = bodiesData[0][0]
        .map(
            ( { el, ids } ) => {
                return { ids, el }
            }
        )
    sectionsData = sectionsData.concat( main_body )
        
    // for additional bodies, only make one section for each body
    let additional_bodies = bodiesData.slice(1)
        .map(
            ( [ sections, body ] ) => {
                const ids = sections.map( s => s.ids ).flat()
                body.classList.add('notesBodyType')
                return {
                    ids,
                    el: body
                }
            }
        )
    sectionsData = sectionsData.concat( additional_bodies )

    let sections = sectionsData
        .map(
            ( { ids, el } ) => {
                const str = template( el.outerHTML )
                
                const blob = new Blob( [str], { type: MIME.HTML } )
                
                const url = URL.createObjectURL( blob )
                urls.push(url)

                return {
                    ids,
                    blob: () => url,
                    getContent: () => {
                        return new DOMParser().parseFromString( str, MIME.HTML as DOMParserSupportedType ).querySelector('section')?.innerHTML ?? ''
                    },
                    // doo't count image data as it'd skew the size too much
                    size: blob.size - Array.from( el.querySelectorAll('[src]'), ( el: Element ) => el.getAttribute('src')?.length ?? 0 ).reduce( (a, b) => a + b, 0 ),
                }
            }
        )

    book.sections = sections.map(
        ( section, index ) => {
            const { ids, blob, getContent, size } = section
            for( const id of ids )
            {
                if( id )
                {
                    idMap.set( id, index )
                }
            }
            return {
                id: index,
                size,
                blob,
                getContent,
            }
        }
    )

    return book
}