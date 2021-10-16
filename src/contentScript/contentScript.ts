import { TAG_WHITELIST } from "../config";
import { ExtensionMessage, ProcessedSentences, WordDetails } from "../typedef";
import WankiContent, { chineseScrapper } from "./wankiContent";

console.log("Content script started");


var wankiContent = new WankiContent();


function messageListener(message: ExtensionMessage, port: chrome.runtime.Port)
{
    console.log(`Message from background : `, message);

    switch (message.method)
    {
        case 'process_sentences_result':
            let processed = message.data as ProcessedSentences;
            console.table(processed.wordData)
            wankiContent.wordDetailsList = processed.wordData;
            wankiContent.injectWordTags(processed.deconstructed)
            wankiContent.setTagStyle()
            break;

        default:
            break;
    }
}

function popupMessageListener(message:ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: ExtensionMessage) => void)
{
    
    console.log("Received message from popup ", message)
    console.log(sender)
    switch (message.method) {
        case 'get_word_data':
            console.log("Sending word data to popup : ", wankiContent.wordDetailsList)
            sendResponse({method:'get_word_data_result', data:wankiContent.getSortedWordDetailsList()})
            break;
        default:
            break;
    }
}


function contentScriptInit()
{
    let sentenceList = wankiContent.preparePage(chineseScrapper)
    if(sentenceList.length == 0) return;
    
    let port = chrome.runtime.connect({ name: "wanki" });
    port.onMessage.addListener(messageListener);

    port.postMessage({ method: 'process_sentences', data: sentenceList} as ExtensionMessage)

    chrome.runtime.onMessage.addListener(popupMessageListener)

}

// TODO: Make sure this gets called only once !!
// window.onload = contentScriptInit
contentScriptInit()