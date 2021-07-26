import { CardInfo, DeckList, IsoLanguage, ProcessedSentences, WordDetails } from "./typedef";
import AnkiController from "./utils/ankiControler";


type SentenceSegmenter = (sentence:string) => string[];


// let chineseSentenceSegmenter: SentenceSegmenter = (sentence)=>
// {
//     // TODO: Offer initialization function and maybe a whole class interface for segmentation
//     let hanzi = require('hanzi');
//     return hanzi.segment(sentence)
// }

export default class Wanki
{

    hanzi = require('hanzi');
    
    ankiConnectHostname = "";
    ankiConnectPort = "";

    deckList: DeckList = {}

    get ankiConnectUrl()
    {
        return `http://${this.ankiConnectHostname}:${this.ankiConnectPort}`;
    }

    constructor(hostname: string, port: string, deckList: DeckList)
    {
        this.ankiConnectHostname = hostname
        this.ankiConnectPort = port
        this.deckList = deckList
        this.hanzi.start();
    }


    /////////////////////////////////////////////////////////////
    // SENTENCE PROCESSING //////////////////////////////////////
    /////////////////////////////////////////////////////////////


    /**
     * Processes a list of sentences to segment them into words and retrieves various informations about them from an Anki deck.
     * @param sentenceList The list of sentences to process.
     * @param language The language of the sentences. Used to select the correct Anki deck.
     * @param sentenceSegmenter A function that segments the sentences appropriately depending on the language.
     * @returns A list of segmented sentences and data for all the words.
     */
    async processSentences(sentenceList: string[], language: IsoLanguage, sentenceSegmenter: SentenceSegmenter)
    {
        let deconstructed: string[][] = []
        let wordSet: Set<string> = new Set()
        let wordData: { [key: string]: WordDetails } = {}

        // Sentence deconstruction
        sentenceList.forEach(sentence =>
        {

            // let wordList = sentenceSegmenter(sentence)
            let wordList: string[] = this.hanzi.segment(sentence)
            deconstructed.push(wordList);

            wordList.forEach(word =>
            {
                if (wordData[word] == undefined) wordData[word] = { word: word, frequency: 0, isInDeck: false, ease: -1, type: -1, interval: 0 };
                wordData[word]['frequency'] += 1;
                wordSet.add(word);
            });
        });

        // Deck information retrieval
        wordData = await this.fillWordDataFromCardInfo(wordData, wordSet, language)

        let result: ProcessedSentences = { deconstructed: deconstructed, wordData: wordData }
        return result;
    }

    /**
     * Returns a list of informations from Anki for a set of words given and a target language.
     * @param wordSet The set of words to retrieve informations for.
     * @param language The language of the word set. Used to select the correct Anki deck.
     * @returns A list of informations from the card for the target word if they exist.
     */
    async getWordsInfo(wordSet: Set<string>, language:IsoLanguage)
    {
        let wordCardList = (await AnkiController.findAllWordsInDeck(this.ankiConnectUrl, wordSet, this.deckList[language].name, this.deckList[language].field)).result
        return (await AnkiController.cardsInfo(this.ankiConnectUrl, wordCardList)).result
    }

    /**
     * Fills a wordData dictionnary already containing the words with information from the Anki deck.
     * @param wordData The prepared wordData dictionnary.
     * @param wordSet The set of words with which to fill the wordData dictionnary.
     * @param language The language of the deck to use.
     * @returns A wordData dictionnary filled with Anki informations for each word.
     */
    async fillWordDataFromCardInfo(wordData: {[key:string]:WordDetails}, wordSet:Set<string>, language: IsoLanguage)
    {
        let wordInfoList: CardInfo[] = await this.getWordsInfo(wordSet, language)
        wordInfoList.forEach((info: CardInfo) =>
        {
            let word = info.fields[this.deckList[language].field].value
            if (wordData[word] != undefined)
            {
                wordData[word].isInDeck = true;
                wordData[word].ease = info.factor;
                wordData[word].type = info.type;
                wordData[word].interval = info.interval;
            }
        });
        return wordData
    }

    /////////////////////////////////////////////////////////////
    // CONFIGURATION METHODS ////////////////////////////////////
    /////////////////////////////////////////////////////////////

    async checkDeckCoherence()
    {
        let results = await AnkiController.deckNamesAndIds(this.ankiConnectUrl);
        console.log(results)
        for(let lang in this.deckList)
        {
            let deck = this.deckList[lang]
            
        }
    }

}