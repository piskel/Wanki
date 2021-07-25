import { ExtensionMessage, WordDetails } from "../typedef";

console.log("Popup script started")

// let buttonConnect = document.getElementById('buttonConnect') as HTMLElement;
let htmlPercentInDeck = document.getElementById("percentInDeck") as HTMLParagraphElement;
let htmlPercentInDeckByFrequency = document.getElementById("percentInDeckByFrequency") as HTMLParagraphElement;

// TODO: Add button to toggle word highlight


// buttonConnect.addEventListener("click", async () =>
// {
//   connectAnki();
// });


// let port = chrome.runtime.connect({ name: "wanki" });
// console.log("connected")

// port.postMessage({method:'get_word_data', sender:"popup", target:"content"} as ExtensionMessage)
// port.onMessage.addListener((message)=>
// {
//     console.log(`Message from ${message.sender} : `, message);
// })

// function messageListener(message:ExtensionMessage, sender:chrome.runtime.MessageSender, sendResponse:(response?:ExtensionMessage)=> void)
// {
//     switch (key) {
//         case value:
            
//             break;
    
//         default:
//             break;
//     }
// }

window.onload = async () =>
{
    // chrome.runtime.onMessage.addListener()

    chrome.tabs.query({active:true, currentWindow:true}, async (tabs: chrome.tabs.Tab[])=>
    {
        let tab = tabs[0]
        if(tab == undefined || tab.id == undefined) return;

        chrome.tabs.sendMessage(tab.id, {method:"get_word_data"} as ExtensionMessage, (response: ExtensionMessage) => {
            
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
            

            htmlPercentInDeck.innerText = percentInDeck.toString()
            htmlPercentInDeckByFrequency.innerText = percentInDeckByFrequency.toString()
        })
    });
}
