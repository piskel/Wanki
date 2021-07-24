
type AnkiRequestAction = "deckNamesAndIds" | "findCards" | "getEaseFactors" | "cardsInfo" | "createDeck" | "getDecks" | "guiAddCards";

var AnkiConnectVersion = 6

interface AnkiRequest
{
    action: AnkiRequestAction
    version: number;
    params?: {}
}

interface AnkiResult
{
    result: any[];
    error: string | null;
}

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


        fetch(this.getAnkiURL(), requestOptions)
            .then(response => response.json() as Promise<AnkiResult>)
            .then(callback)
            .catch(this.errorHandler);
        // return jsonResponse;
    }


    static errorHandler(error: any)
    {
        console.log('error', error)
    }

    /////////////////////////////////////////////////////////////
    // ANKI CONNECT FUNCTIONS ///////////////////////////////////
    /////////////////////////////////////////////////////////////

    static findCard(query: string, callback: (results: AnkiResult) => void)
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

    // TODO: For mass query, using callback does not scale. Use async/await
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

    static findWordInDeck(word: string, deck: string, field: string, callback: (results: AnkiResult) => void)
    {
        let query = `deck:"${deck}" ${field}:"${word}"`
        this.findCard(query, callback);
    }

}
