import { NODES_DEF } from "@/tools/fb2/types"
import { NS, TEXT_STYLE_ELEMENTS, STANZA_CHILD_ELEMENTS } from  "@/tools/fb2/consts"

export default class FB2Converter
{
    fb2: Document
    doc: XMLDocument
    binaries: Map<string,Element>

    constructor(fb2: Document)
    {
        this.fb2 = fb2

        this.doc = document.implementation.createDocument( NS.XHTML, 'html' )

        this.binaries = new Map(
            Array.from(
                this.fb2.getElementsByTagName('binary'),
                ( el ) => { return [ el.id, el ] }
            )
        )
    }

    getImageSrc( el: Element ): string
    {
        const href = el.getAttributeNS( NS.XLINK, 'href' )
        if( !href )
        {
            return 'data:,'
        }
        const [ _, id ] = href.split('#')
        if( !id )
        {
            return href
        }
        const binary = this.binaries.get(id)
        return binary ? `data:${ binary.getAttribute('content-type') };base64,${ binary.textContent }` : href
    }

    // RENDER_TAG
    image( node: Element ): Element
    {
        const el = this.doc.createElement( 'img' )
        let alt = node.getAttribute( 'alt' ) ?? ''
        if( alt )
        {
            el.alt = alt
        }
        let title = node.getAttribute( 'title' ) ?? ''
        if( title )
        {
            el.title = title
        }
        // el.classList.add( node.nodeName )
        el.setAttribute( 'src', this.getImageSrc( node ) )
        return el
    }

    // RENDER_TAG
    anchor( node: Element ): Element
    {
        const el = this.convert( node, { 'a': ['a', TEXT_STYLE_ELEMENTS] } )

        el.setAttribute( 'href', node.getAttributeNS( NS.XLINK, 'href' ) ?? '' )

        if( node.getAttribute('type') === 'note' )
        {
            el.setAttributeNS( NS.EPUB, 'epub:type', 'noteref' )
        }
        return el
    }

    // RENDER_TAG
    stanza( node: Element ): Element
    {
        const el = this.convert( node, { 'stanza': [ 'p', STANZA_CHILD_ELEMENTS ] } )
        for( const child of node.children )
        {
            if( child.nodeName === 'v' && child.textContent )
            {
                el.append( this.doc.createTextNode( child.textContent ) )
                el.append( this.doc.createElement( 'br' ) )
            }
        }
        return el
    }

    convert( node: Element, definition: NODES_DEF ): any
    {
        // not an element; return text content
        if( node.nodeType === 3 && node.textContent && !( /^\s*$/.test( node.textContent ) ) )
        {
            return this.doc.createTextNode( node.textContent )
        }
        if( node.nodeType === 4 && node.textContent )
        {
            return this.doc.createCDATASection( node.textContent )
        }
        if( node.nodeType === 8 && node.textContent )
        {
            return this.doc.createComment( node.textContent )
        }

        const def = definition?.[ node.nodeName ]
        if( !def )
        {
            // do not convert not supported tags
            return null
        }

        switch( node.nodeName )
        {
            case 'stanza':
                return this.stanza( node )
            case 'image':
                return this.image( node )
            case 'anchor':
                return this.anchor( node )
        }

        const [ name, opts, attrs ] = def
        const el = this.doc.createElement(name)

        // copy the ID, and set class name from original element name
        if( node.id )
        {
            el.id = node.id
        }
        // el.classList.add( node.nodeName )

        // copy attributes
        if( Array.isArray( attrs ) )
        {
            for( const attr of attrs )
            {
                const attr_value = node.getAttribute( attr )
                if( attr_value )
                {
                    el.setAttribute( attr, attr_value )
                }
            }
        }

        // process child elements recursively
        const childDef = opts === 'self' ? def : opts
        let child = node.firstChild

        // if( node.children.length == 1 && node.children[0]?.nodeName == 'image' )
        // {
        //     return this.convert( node.children[0] as Element, childDef as NODES_DEF )
        // }
        
        while( child )
        {
            const childEl = this.convert( child as Element, childDef as NODES_DEF )
            if(childEl)
            {
                el.append( childEl )
            }
            child = child.nextSibling
        }
        return el
    }
}