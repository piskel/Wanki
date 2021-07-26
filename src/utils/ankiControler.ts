import { ANKI_CONNECT_VERSION } from "../config";
import { AnkiRequest, AnkiResult } from "../typedef";




export default class AnkiController
{
    /////////////////////////////////////////////////////////////
    // NETWORK FUNCTIONS ////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    static async sendRequest(url:string, request: AnkiRequest)
    {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(request);

        var requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        let response = await fetch(url, requestOptions)

        console.log("Sending request : ", request)
        return await response.json() as AnkiResult;
    }


    static errorHandler(error: any)
    {
        console.log('error ', error)
    }

    /////////////////////////////////////////////////////////////
    // ANKI CONNECT FUNCTIONS ///////////////////////////////////
    /////////////////////////////////////////////////////////////

    static async version(url:string)
    {
        let request: AnkiRequest =
        {
            action: "version",
            version: ANKI_CONNECT_VERSION
        }
        return await this.sendRequest(url, request)

    }

    static async findCards(url:string, query: string)
    {
        let request: AnkiRequest =
        {
            action: "findCards",
            params:
            {
                query: query
            },
            version: ANKI_CONNECT_VERSION
        }
        return await this.sendRequest(url, request);
    }

    static async cardsInfo(url:string, cards: number[])
    {
        let request: AnkiRequest =
        {
            action: "cardsInfo",
            params:
            {
                cards: cards
            },
            version: ANKI_CONNECT_VERSION
        }
        return await this.sendRequest(url, request);
    }

    static async getEaseFactor(url:string, cards: number[])
    {
        let request: AnkiRequest =
        {
            action: "getEaseFactors",
            params:
            {
                cards: cards
            },
            version: ANKI_CONNECT_VERSION
        }
        return await this.sendRequest(url, request);
    }

    static async deckNamesAndIds(url:string)
    {
        let request: AnkiRequest =
        {
            action: "deckNamesAndIds",
            version: ANKI_CONNECT_VERSION
        }
        return await this.sendRequest(url, request);
    }

    static createDeck(url:string, deck: string)
    {
        let request: AnkiRequest =
        {
            action: "createDeck",
            params:
            {
                deck: deck
            },
            version: ANKI_CONNECT_VERSION
        }
        this.sendRequest(url, request)
    }

    static guiAddCards(url:string, deckName: string, modelName: string, fields: { [field: string]: string }, options: { [option: string]: any }, tags: string[])
    {
        let request: AnkiRequest =
        {
            action: "guiAddCards",
            params:
            {
                note: {
                    deckName: deckName,
                    modelName: modelName,
                    fields: fields,
                    options: options,
                    tags: tags
                }
            },
            version: ANKI_CONNECT_VERSION
        }
        this.sendRequest(url, request)
    }

    /////////////////////////////////////////////////////////////
    // WANKI SPECIALIZED FUNCTIONS //////////////////////////////
    /////////////////////////////////////////////////////////////

    static async findWordsInDeck(url:string, word: string, deck: string, field: string)
    {
        let query = `${field}:"${word}" deck:"${deck}"`;
        return await this.findCards(url, query);
    }

    static async findAllWordsInDeck(url:string, wordSet: Set<string>, deck: string, field: string)
    {
        let searchRegex = "re:(\\b"
        searchRegex += Array.from(wordSet).join('\\b|\\b')
        searchRegex += "\\b)"

        let wordsDeck = (await this.findWordsInDeck(url, searchRegex, deck, field));
        return wordsDeck
    }

}
