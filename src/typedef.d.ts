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
    type: number
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
    factor: number,
    css: string,
    cardId: number,
    interval: number,
    note: number,
    ord: number,
    type: number,
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