import { strict } from "assert/strict";

console.log("Content script started");

// TODO: Add support for returning subtags (lang+script+region)
function getISOCode()
{
    let isoCode = document.getElementsByTagName("html")[0].lang;
    let subtags = isoCode.split('-');
    return subtags[0];
}

/**
 * Returns the list of Chinese text found on the page
 * @returns A string array containing the texts.
 */
function getPhraseList()
{
    let fullTextRaw = document.body.innerText;
    let fullTextFiltered = fullTextRaw.match(/[\u4E00-\u9FA5]+/g);
    if(fullTextFiltered == null) fullTextFiltered = [];
    console.log("Nb sentences found : " + fullTextFiltered.length)
    return fullTextFiltered;
}

// TODO: Should take in a dictionnary with information about each words
// (%learned, frequency, etc...)
function addWordTags(deconstructedList: string[][])
{
    let innerHTML = document.body.innerHTML;
    
    console.log("Nb of deconstructed sentences : ", deconstructedList.length)

    // FIXME: Segmentation must be done per case for each sentence
    let index = -1
    deconstructedList.forEach(deconstructed => {
        let reconstructed = ""
        
        deconstructed.forEach(word => {
            reconstructed += "<span class=\"wanki\">" + word + "</span>";
        });

        innerHTML = innerHTML.replace(/(?<!\<span.*class\=\"wanki\".*\>[\u4E00-\u9FFF]*)[\u4E00-\u9FFF]+/, reconstructed);
    });

    // wordSet.forEach(word => {
    //     innerHTML = innerHTML.replace(word, "<span class=\"wanki\">"+word+"</span>")
    // });

    document.body.innerHTML = innerHTML

    console.log("Tag insertion done")
}



chrome.runtime.onConnect.addListener(port =>
    {
        console.log("Connected to background script");
        port.onMessage.addListener(message =>
            {
                console.log("Message received : ", message);
                switch (message.method) {
                    case "get_phrase_list":
                        port.postMessage({method:"get_phrase_list", data: getPhraseList()})
                        break;
                    
                    case "add_word_tags":
                        addWordTags(message.data)
                        break;
                
                    default:
                        break;
                }
            })
    });