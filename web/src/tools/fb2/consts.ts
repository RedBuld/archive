import { NODES_DEF } from "@/tools/fb2/types"

export const NS = {
    XLINK: 'http://www.w3.org/1999/xlink',
    EPUB: 'http://www.idpf.org/2007/ops',
    XHTML: 'http://www.w3.org/1999/xhtml'
}

export const MIME = {
    XML: 'application/xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
}

export const TEXT_STYLE_ELEMENTS: NODES_DEF = {
    'strong':        [ 'strong', 'self' ],
    'emphasis':      [ 'em', 'self' ],
    'style':         [ 'span', 'self' ],
    'a':             [ 'anchor' ],
    'strikethrough': [ 's', 'self' ],
    'sub':           [ 'sub', 'self' ],
    'sup':           [ 'sup', 'self' ],
    'code':          [ 'code', 'self' ],
    'image':         [ 'image' ],
};

export const TABLE_CHILDS_ELEMENTS: NODES_DEF = {
    'th':            [ 'th', TEXT_STYLE_ELEMENTS, ['colspan', 'rowspan', 'align', 'valign'] ],
    'td':            [ 'td', TEXT_STYLE_ELEMENTS, ['colspan', 'rowspan', 'align', 'valign'] ],
}

export const TITLE_CHILD_ELEMENTS: NODES_DEF = {
    'p':             [ 'h1', TEXT_STYLE_ELEMENTS ],
    'empty-line':    [ 'br' ],
}

export const STANZA_TITLE_ELEMENTS: NODES_DEF = {
    'p':             [ 'strong', TEXT_STYLE_ELEMENTS ],
    'empty-line':    [ 'br' ],
}

export const STANZA_CHILD_ELEMENTS: NODES_DEF = {
    'title':         [ 'header', STANZA_TITLE_ELEMENTS ],
    'subtitle':      [ 'p', TEXT_STYLE_ELEMENTS ],
}

export const TABLE: NODES_DEF = {
    'tr':            [ 'tr', TABLE_CHILDS_ELEMENTS, ['align'] ],
}

export const POEM: NODES_DEF = {
    'epigraph':      [ 'blockquote' ],
    'subtitle':      [ 'h2', TEXT_STYLE_ELEMENTS ],
    'text-author':   [ 'p', TEXT_STYLE_ELEMENTS ],
    'date':          [ 'p', TEXT_STYLE_ELEMENTS ],
    'stanza':        [ 'stanza' ],
}

export const SECTION: NODES_DEF = {
    'title':         [ 'header', TITLE_CHILD_ELEMENTS ],
    'epigraph':      [ 'blockquote', 'self' ],
    'image':         [ 'image' ],
    'annotation':    [ 'aside' ],
    'section':       [ 'section', 'self'],
    'p':             [ 'p', TEXT_STYLE_ELEMENTS ],
    'poem':          [ 'blockquote', POEM ],
    'subtitle':      [ 'h2', TEXT_STYLE_ELEMENTS ],
    'cite':          [ 'blockquote', 'self' ],
    'empty-line':    [ 'br' ],
    'table':         [ 'table', TABLE ],
    'text-author':   [ 'p', TEXT_STYLE_ELEMENTS ],
}

export const ANNOTATION: NODES_DEF = {
    'annotation':  [ 'div', SECTION ]
}

POEM['epigraph'][1] = SECTION
SECTION['p'][1] = { ...TEXT_STYLE_ELEMENTS, ...{ 'p': SECTION[ 'p' ] } }

export const BODY: NODES_DEF = {
    'image':       [ 'image' ],
    'title':       [ 'section', TITLE_CHILD_ELEMENTS ],
    'epigraph':    [ 'section', SECTION ],
    'section':     [ 'section', SECTION ],
}