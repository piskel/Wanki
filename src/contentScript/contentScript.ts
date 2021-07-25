import { ProcessedSentences, WordDetails } from "../typedef";

console.log("Content script started");


// TODO: Move to local storage ??
let tagWhitelist = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "td", "label", "div", "span", "q"]

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
            reconstructedSentence += `<span class="wanki wanki_word wanki_word_${word}" id="wanki_word_${wordNo}" style="color:green !important">${word}</span>`;
            
            wordNo++;
        });
        // TODO: Error handling if the sentence tag is not found
        sentenceElement!.innerHTML = reconstructedSentence;
    }
}


// Word highlight:
// - green: high ease
// - red: low ease
// - gray: not in deck

function preparePage()
{
    let sentenceList: string[] = []
    let sentenceNo = 0

    tagWhitelist.forEach(tagName =>
    {
        let elementList = document.getElementsByTagName(tagName);

        for (let i = 0; i < elementList.length; i++)
        {
            let element = elementList.item(i)
            
            // TODO: Check for better filtering when tag has child node
            if (element == null || element.children.length != 0 || element.textContent == null || element.classList.contains("wanki")) continue;

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
        if(wordData[key].isInDeck) continue;
        let wordTags = Array.from(document.getElementsByClassName(`wanki_word_${key}`))
        wordTags.forEach(tag => {
            tag.setAttribute("style", "color: red")
        });
    }
}


function messageListener(message: any, port: chrome.runtime.Port)
{
    console.log("Message from background script : ", message);
    
    switch (message.method)
    {
        case 'process_sentences_result':
            let processed = message.result as ProcessedSentences
            addWordTags(processed.deconstructed)
            setTagColor(processed.wordData)
            break;

        default:
            break;
    }
}


function contentScriptInit()
{
    let sentenceList = preparePage()
    if(sentenceList.length != 0)
    {
        let port = chrome.runtime.connect({ name: "wanki" });
        port.onMessage.addListener(messageListener);
        port.postMessage({ method: 'process_sentences', sentenceList: sentenceList })
    }   
}

// TODO: Make sure this gets called only once !!
// window.onload = contentScriptInit
contentScriptInit()