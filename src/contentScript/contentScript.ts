import { TAG_WHITELIST } from "../config";
import { ExtensionMessage, ProcessedSentences, WordDetails } from "../typedef";


console.log("Content script started");

var pageWordData: { [key: string]: WordDetails } = {}

// TODO: Add support for returning subtags (lang+script+region)
function getISOCode()
{
    let isoCode = document.getElementsByTagName("html")[0].lang;
    let subtags = isoCode.split('-');
    return subtags[0];
}

function addWordTags(segmentedSentences: string[][])
{
    let wordNo = 0
    for (let i = 0; i < segmentedSentences.length; i++)
    {
        let segmentedSentence = segmentedSentences[i]
        let sentenceElement = document.getElementById(`wanki_sentence_${i}`);

        if (sentenceElement == null) continue;

        let reconstructedSentence = ""
        segmentedSentence.forEach(word =>
        {
            reconstructedSentence += `<span class="wanki wanki_word wanki_word_${word}">${word}</span>`;
            
            wordNo++;
        });
        // TODO: Error handling if the sentence tag is not found
        sentenceElement!.innerHTML = reconstructedSentence;
    }
}


function preparePage()
{
    let sentenceList: string[] = []
    let sentenceNo = 0

    TAG_WHITELIST.forEach(tagName =>
    {
        let elementList = document.getElementsByTagName(tagName);

        for (let i = 0; i < elementList.length; i++)
        {
            let element = elementList.item(i)
            
            // TODO: Check for better filtering when tag has child node
            if (element == null || element.children.length != 0 || element.textContent == null || element.classList.contains("wanki")) continue;

            // TODO: Are those two lines bellow really useful ??
            let matches = element.textContent.match(/[\u4E00-\u9FA5]+/g)
            if (matches == null) continue;

            element.innerHTML = element.textContent.replace(/[\u4E00-\u9FA5]+/g, a => 
            {
                sentenceList[sentenceNo] = a
                let result = `<span class="wanki wanki_sentence" id="wanki_sentence_${sentenceNo}">${a}</span>`
                
                sentenceNo++;
                return result;

            });
        }
    });
    return sentenceList;
}

function setTagColor(wordData: { [key: string]: WordDetails })
{
    for (let key in wordData)
    {
        let wordTags = Array.from(document.getElementsByClassName(`wanki_word_${key}`))

        let style = ''

        // Word is in deck
        if(wordData[key].isInDeck)
        {
            style += 'color:green;'
        }
        else
        {
            style += 'color:gray;'
        }

        wordTags.forEach(tag => {
            tag.setAttribute("style", style)
        });
    }
}


function messageListener(message: ExtensionMessage, port: chrome.runtime.Port)
{
    console.log(`Message from background : `, message);

    switch (message.method)
    {
        case 'process_sentences_result':
            let processed = message.data as ProcessedSentences;

            pageWordData = processed.wordData;
            addWordTags(processed.deconstructed)
            setTagColor(processed.wordData)
            break;

        // case 'get_word_data':
        //     port.postMessage({method: 'get_word_data_result', data:pageWordData, sender:"content", target:message.sender} as ExtensionMessage)

        default:
            break;
    }
}

function popupMessageListener(message:ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: ExtensionMessage) => void)
{

    console.log("Received message from popup ", message)

    switch (message.method) {
        case 'get_word_data':
            console.log("Sending word data to popup : ", pageWordData)
            sendResponse({method:'get_word_data_result', data:pageWordData})
            break;
    
        default:
            break;
    }
}


function contentScriptInit()
{
    let sentenceList = preparePage()
    if(sentenceList.length == 0) return;
    
    let port = chrome.runtime.connect({ name: "wanki" });
    port.onMessage.addListener(messageListener);

    port.postMessage({ method: 'process_sentences', data: sentenceList} as ExtensionMessage)

    chrome.runtime.onMessage.addListener(popupMessageListener)

}

// TODO: Make sure this gets called only once !!
// window.onload = contentScriptInit
contentScriptInit()