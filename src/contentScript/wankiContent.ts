import { TAG_WHITELIST } from "../config";
import { IsoLanguage, WordDetails } from "../typedef";

/**
 * This must find sentences in the target language and give them to a callback.
 */
type SentenceScrapper = (element: Element, callback: (sentence: string) => string) => void;


export let chineseScrapper: SentenceScrapper = (element, callback) =>
{
    element.innerHTML = element.textContent!.replace(/[\u4E00-\u9FA5]+/g, callback);
}

export default class WankiContent
{
    wordDetailsList: { [key: string]: WordDetails } = {}


    constructor() { }


    /////////////////////////////////////////////////////////////
    // DOM MANIPULATION FUNCTION ////////////////////////////////
    /////////////////////////////////////////////////////////////

    /**
     * Finds language information from the html tag
     * @returns The iso code for the page language.
     */
    static getISOLanguage(): IsoLanguage
    {
        // TODO: Add support for returning subtags (lang+script+region)
        let isoCode = document.getElementsByTagName("html")[0].lang;
        let subtags = isoCode.split('-');
        return subtags[0] as IsoLanguage;
    }


    /**
     * Prepares the page by injecting wanki tags around all detected sentences and returns them.
     * @param sentenceScrapper A function that finds all the sentences within an HTMLElement.
     * @returns A list of all the detected string sentences.
     */
    preparePage(sentenceScrapper: SentenceScrapper)
    {
        let sentenceList: string[] = []
        let sentenceNo = 0

        TAG_WHITELIST.forEach(tagName =>
        {
            let elementList = Array.from(document.getElementsByTagName(tagName));
            elementList.forEach(element =>
            {
                // Element filter
                if (element == null || element.children.length != 0 || element.textContent == null || element.classList.contains("wanki")) return;

                sentenceScrapper(element, sentence =>
                {
                    sentenceList[sentenceNo] = sentence
                    sentenceNo++;
                    return `<span class="wanki wanki_sentence" id="wanki_sentence_${sentenceNo - 1}">${sentence}</span>`;
                });
            });
        });
        return sentenceList;
    }

    injectWordTags(segmentedSentences: string[][])
    {
        let wordNo = 0
        for (let i = 0; i < segmentedSentences.length; i++)
        {
            let sentenceElement = document.getElementById(`wanki_sentence_${i}`);

            if (sentenceElement == null) continue;

            let reconstructedSentence = ""
            segmentedSentences[i].forEach(word =>
            {
                reconstructedSentence += `<span class="wanki wanki_word wanki_word_${word}">${word}</span>`;
                wordNo++;
            });
            // TODO: Error handling if the sentence tag is not found
            sentenceElement!.innerHTML = reconstructedSentence;
        }
    }

    /**
     * Will change words appearances depending on their properties.
     */
    setTagStyle()
    {
        for (let key in this.wordDetailsList)
        {
            let wordTags = Array.from(document.getElementsByClassName(`wanki_word_${key}`))


            // Style if word is not in deck
            let style = 'background-color: rgb(220, 220, 220)'

            // If word is in deck
            if (this.wordDetailsList[key].isInDeck)
            {
                // hue: red = 0°, yellow = 60°, green = 130°
                let hue = 60 + this.wordDetailsList[key].interval * 5

                style = `background-color: hsl(${hue}, 100%, 80%)`
            }

            wordTags.forEach(tag =>
            {
                tag.setAttribute("style", style)
            });
        }
    }

    /////////////////////////////////////////////////////////////
    // WORD STATISTICS FUNCTIONS ////////////////////////////////
    /////////////////////////////////////////////////////////////

    /**
     * Returns a sorted list of words details by their frequency
     * @returns 
     */
    getSortedWordDetailsList()
    {
        let wordDetailsList = this.wordDetailsList
        let items = Object.keys(wordDetailsList).map(key =>
        {
            return wordDetailsList[key];
        });
        items.sort((first, second) =>
        {
            return (second as WordDetails).frequency - (first as WordDetails).frequency;
        })
        return items;
    }

}
