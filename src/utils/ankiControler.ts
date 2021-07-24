
type AnkiRequestAction = "findCards" | "getEaseFactors" | "cardsInfo" | "createDeck" | "getDecks" | "guiAddCards";

var AnkiConnectVersion = 6

interface AnkiRequest
{
    action: AnkiRequestAction
    version: number;
    params: {}
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

    // static getAnkiURL(callback:()=>void))
    // {
    //     chrome.storage.sync.get(["ankiConnect"], (result, callback) =>
    //     {
    //         console.log(result)
    //         let url = `http://${result['hostname']}:${result['port']}`
    //         callback(url)
    //     });
    //     // return `http://${connectInfos['hostname']}:${connectInfos['port']}`
    // }

    // TODO: Use Chrome Storage
    static getAnkiURL()
    {
        
        return `http://localhost:8765`
    }

    static sendRequest(request: AnkiRequest, callback:(results: AnkiResult)=>void)
    {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
      
        var raw = JSON.stringify(request);
      
        var requestOptions: RequestInit  = {
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


    static errorHandler(error:any)
    {
        console.log('error', error)
    }

    /////////////////////////////////////////////////////////////
    // ANKI CONNECT FUNCTIONS ///////////////////////////////////
    /////////////////////////////////////////////////////////////

    static findCard(query: string, callback:(results: AnkiResult)=>void)
    {
        let request: AnkiRequest =
        {
            action:"findCards",
            params:
            {
                query: query
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static cardsInfo(cards: number[], callback:(results: AnkiResult)=>void)
    {
        let request: AnkiRequest =
        {
            action:"cardsInfo",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }

    static getEaseFactor(cards:number[], callback:(results: AnkiResult)=>void)
    {
        let request: AnkiRequest =
        {
            action:"getEaseFactors",
            params:
            {
                cards: cards
            },
            version: AnkiConnectVersion
        }
        this.sendRequest(request, callback)
    }
    
    /////////////////////////////////////////////////////////////
    // WANKI SPECIALIZED FUNCTIONS //////////////////////////////
    /////////////////////////////////////////////////////////////

    static findWordInDeck(word:string, deck:string, field:string, callback:(results: AnkiResult)=>void)
    {
        let query = `deck:"${deck}" ${field}:"${word}"`
        this.findCard(query, callback);
    }

    // Find by fields : "deck:<deck_name> <word_field>:<word>"

}
