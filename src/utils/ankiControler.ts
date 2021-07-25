import { AnkiRequest, AnkiResult } from "../typedef";


var AnkiConnectVersion = 6


export default class AnkiController
{
    /////////////////////////////////////////////////////////////
    // NETWORK FUNCTIONS ////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    // TODO: Use Chrome Storage
    static getAnkiURL()
    {
        return `http://localhost:8765`
    }

    // TODO: Handle when Anki is not opened
    static sendRequest(request: AnkiRequest, callback: (results: AnkiResult) => void)
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

        console.log("Sending request : ", request)
        fetch(this.getAnkiURL(), requestOptions)
            .then(response => response.json() as Promise<AnkiResult>)
            .then(callback)
            .catch(this.errorHandler);
    }

    static async sendRequestAsync(request: AnkiRequest)
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
        let response = await fetch(this.getAnkiURL(), requestOptions)

        console.log("Sending request : ", request)
        return await response.json()  as AnkiResult;
    }


    static errorHandler(error: any)
    {
        console.log('error ', error)
    }

    /////////////////////////////////////////////////////////////
    // ANKI CONNECT FUNCTIONS ///////////////////////////////////
    /////////////////////////////////////////////////////////////

    static async version()
    {
        let request: AnkiRequest =
        {
            action: "version",
            version: AnkiConnectVersion
        }
        return await this.sendRequestAsync(request)

    }

    static findCards(query: string, callback: (results: AnkiResult) => void)
    {
        let request: AnkiRequest =
        {
            action: "findCards",
            params:
            {
                query: query
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static async findCardsAsync(query: string)
    {
        let request: AnkiRequest =
        {
            action: "findCards",
            params:
            {
                query: query
            },
            version: AnkiConnectVersion
        }
        return await this.sendRequestAsync(request);
    }

    static cardsInfo(cards: number[], callback: (results: AnkiResult) => void)
    {
        let request: AnkiRequest =
        {
            action: "cardsInfo",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static async cardsInfoAsync(cards: number[])
    {
        let request: AnkiRequest =
        {
            action: "cardsInfo",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        return await this.sendRequestAsync(request);
    }

    static getEaseFactor(cards: number[], callback: (results: AnkiResult) => void)
    {
        let request: AnkiRequest =
        {
            action: "getEaseFactors",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static async getEaseFactorAsync(cards: number[])
    {
        let request: AnkiRequest =
        {
            action: "getEaseFactors",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        return await this.sendRequestAsync(request);
    }

    static deckNamesAndIds(callback: (results: AnkiResult) => void)
    {
        let request: AnkiRequest =
        {
            action: "deckNamesAndIds",
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static createDeck(deck: string, callback: (results: AnkiResult) => void)
    {
        let request: AnkiRequest =
        {
            action: "createDeck",
            params:
            {
                deck: deck
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static guiAddCards(deckName: string, modelName: string, fields: { [field: string]: string }, options: { [option: string]: any }, tags: string[], callback: (results: AnkiResult) => void)
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
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    /////////////////////////////////////////////////////////////
    // WANKI SPECIALIZED FUNCTIONS //////////////////////////////
    /////////////////////////////////////////////////////////////

    static findWordsInDeck(word: string, deck: string, field: string, callback: (results: AnkiResult) => void)
    {
        let query = `"${field}":"${word}" deck:"${deck}"`;
        this.findCards(query, callback);
    }

    static async findWordsInDeckAsync(word: string, deck: string, field: string)
    {
        let query = `"${field}":"${word}" deck:"${deck}"`;
        return await this.findCardsAsync(query);

    }

    static async findAllWordsInDeckAsync(wordSet: Set<string>, deck: string, field: string)
    {
        let searchRegex = "re:(\\b"
        searchRegex += Array.from(wordSet).join('\\b|\\b')
        searchRegex += "\\b)"

        let wordsDeck = (await this.findWordsInDeckAsync(searchRegex, deck, field));
        return wordsDeck
    }

}
