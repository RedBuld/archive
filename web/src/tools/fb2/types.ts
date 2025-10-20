// converter types
export type RENDER_TAG = string
export type NODE_CHILDS = string | NODES_DEF
export type NODE_ATTRS = string[]

export type COMPLEX_FB2_NODE_DEF = [ RENDER_TAG ] | [ RENDER_TAG, NODE_CHILDS ] | [ RENDER_TAG, NODE_CHILDS, NODE_ATTRS ]
export type NODES_DEF = {
    [key: string]: COMPLEX_FB2_NODE_DEF
}

// book types

export type BookPerson = string | { name: string; sortAs: string | null }

export type BookContributor = ( { name: string; sortAs: string | null; } | { name: string; } ) & { role: string; }

export type BookMetadata = {
    title: string
    identifier: string
    language: string
    author: BookPerson[]
    translator: BookPerson[]
    contributor: BookContributor[]
    publisher: string
    published: string
    modified: string
    description: string
    subject: string[]
}

export type BookSection = {
    id: number
    size: number
    blob: () => string
    getContent: () => string
}

export type Book = {
    metadata: BookMetadata
    sections: BookSection[],
    getCover: () => Promise<Blob>|null
    resolveHref: Function
    destroy: Function
}


// parser types

export type SectionIds = {
    el:Element,
    ids:string[]
}
export type BodyWithSectionsIds = [ SectionIds[], Element ]

export type Section = {
    ids: string[]
    el: Element
}