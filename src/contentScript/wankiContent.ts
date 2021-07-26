import { tagWhitelist } from "../config";
import { IsoLanguage, WordDetails } from "../typedef";

/**
 * This must find sentences in the target language and give them to a callback.
 */
type SentenceScrapper = (element: Element, callback: (sentence: string) => string) => void;


let chineseScrapper: SentenceScrapper = (element, callback) =>
{
    element.innerHTML = element.textContent!.replace(/[\u4E00-\u9FA5]+/g, callback);
}

export default class WankiContent
{
    wordDetailsList: { [key: string]: WordDetails } = {}


    constructor() { }

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

        tagWhitelist.forEach(tagName =>
        {
            let elementList = Array.from(document.getElementsByTagName(tagName));
            elementList.forEach(element =>
            {
                // Element filter
                if (element == null || element.children.length != 0 || element.textContent == null || element.classList.contains("wanki")) return;

                // sentenceScrapper(element, sentence =>
                chineseScrapper(element, sentence =>
                {
                    sentenceList[sentenceNo] = sentence
                    sentenceNo++;
                    return `<span class="wanki wanki_sentence" id="wanki_sentence_${sentenceNo - 1}">${sentence}</span>`;
                });
            });
        });
        return sentenceList;
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
            let style = 'color:gray;'

            // If word is in deck
            if (this.wordDetailsList[key].isInDeck)
            {
                // TODO: Change color depending on how well the word is know
                // ...
                style = 'color:green;'
            }

            wordTags.forEach(tag =>
            {
                tag.setAttribute("style", style)
            });
        }
    }
}
