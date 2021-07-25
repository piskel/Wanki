import { ExtensionMessage, WordDetails } from "../typedef";

console.log("Popup script started")

let htmlPercentInDeck = document.getElementById("percentInDeck") as HTMLParagraphElement;
let htmlPercentInDeckByFrequency = document.getElementById("percentInDeckByFrequency") as HTMLParagraphElement;
let htmlTopWordsNotInDeck = document.getElementById("topWordsNotInDeck") as HTMLParagraphElement;

// TODO: Add button to toggle word highlight


window.onload = async () =>
{
    chrome.tabs.query({active:true, currentWindow:true}, async (tabs: chrome.tabs.Tab[])=>
    {
        let tab = tabs[0]
        if(tab == undefined || tab.id == undefined) return;

        chrome.tabs.sendMessage(tab.id, {method:"get_word_data"} as ExtensionMessage, (response: ExtensionMessage) => {
            
            // TODO: Move statistics calculation to the contentScript
            // FIXME: So far from clean I consider it an issue on its own
            console.log("Received response : ", response)
            let wordData = response.data as { [key: string]: WordDetails };
            
            

            let percentInDeck = 0
            let percentInDeckByFrequency = 0
            
            let totalWordsInSet = 0
            let totalWords = 0
            for(let key in wordData)
            {
                percentInDeck += wordData[key].isInDeck ? 1:0;
                percentInDeckByFrequency += wordData[key].isInDeck ? wordData[key].frequency : 0
                
                totalWordsInSet++;
                totalWords += wordData[key].frequency
            }
            percentInDeck /= totalWordsInSet/100;
            percentInDeckByFrequency /= totalWords/100;
            console.log(percentInDeck)
            console.log(percentInDeckByFrequency)


            // Getting top words (from deck)
            // Make it get the top words that ARE NOT in the deck
            let items = Object.keys(wordData).map(function(key){
                return [key, wordData[key]]
            })
            items.sort((first, second) =>
            {
                return (second[1] as WordDetails).frequency - (first[1] as WordDetails).frequency;
            })
            let topWords = ""
            // We take the top 5 words
            items.slice(0, 5).forEach((topWord)=>{
                topWords += topWord[0] as string + "<br>"
            })
            
            htmlTopWordsNotInDeck.innerHTML = topWords
            htmlPercentInDeck.innerText = percentInDeck.toString()
            htmlPercentInDeckByFrequency.innerText = percentInDeckByFrequency.toString()
        })
    });
}
