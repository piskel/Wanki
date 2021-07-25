export type AnkiRequestAction = "version"|"deckNamesAndIds" | "findCards" | "getEaseFactors" | "cardsInfo" | "createDeck" | "getDecks" | "guiAddCards";

export interface AnkiRequest
{
    action: AnkiRequestAction
    version: number;
    params?: {}
}

export interface AnkiResult
{
    result: any[];
    error: string | null;
}

export interface WankiConfiguration
{
    ankiConnect:
    {
        hostname:string,
        port:string
    },
    deck:
    {
        name: string,
        frontField: string
    }
}

export interface WordDetails
{
    word: string,
    frequency: number,
    isInDeck: boolean,
    ease: number,
    type: number,
    interval: number
}

export interface CardInfoField
{
    value: string,
    order: number
}
export interface CardInfo
{
    answer: string,
    question: string,
    deckName: string,
    modelName: string,
    fieldOrder: number,
    fields: {[fieldName:string]: CardInfoField},
    factor: number, // Ease factor
    css: string,
    cardId: number,
    interval: number, // Positive values are days, negative are seconds
    note: number,
    ord: number,
    type: number, // This is 0 for learning cards, 1 for review cards, 2 for relearn cards, and 3 for early "cram" cards.
    queue: number,
    due: number,
    reps: number,
    lapses: number,
    left: number
}

export interface ProcessedSentences
{
    deconstructed: string[][],
    wordData: { [key: string]: WordDetails }
}

type TargetContext = "background" | "content" | "popup"

export interface ExtensionMessage
{
    method: string,
    data?: any
}