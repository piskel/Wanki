import { ExtensionMessage, WordDetails } from "../typedef";

console.log("Popup script started")

let htmlTotalWordCount = document.getElementById("totalWordCount") as HTMLParagraphElement;
let htmlPercentInDeck = document.getElementById("percentInDeck") as HTMLParagraphElement;
let htmlPercentInDeckByFrequency = document.getElementById("percentInDeckByFrequency") as HTMLParagraphElement;
let htmlTopWordsNotInDeck = document.getElementById("topWordsNotInDeck") as HTMLParagraphElement;

// TODO: Add button to toggle word highlight



function processWordStatistics(wordData: WordDetails[])
{
    let topUnknownWords: WordDetails[] = []
    let totalUnknowWords = 0
    let topNotInDeckWords: WordDetails[] = []
    let totalNotInDeck = 0

    let totalWords = 0

    wordData.forEach(wordDetails =>
    {
        totalWords += wordDetails.frequency

        if (wordDetails.type == -1)
        {
            totalNotInDeck += wordDetails.frequency
            topNotInDeckWords.push(wordDetails);
        }
        else if (wordDetails.type == 0)
        {
            totalUnknowWords += wordDetails.frequency
            topUnknownWords.push(wordDetails)
        }
    });
    let percentInDeck = 100 * (1 - topNotInDeckWords.length / wordData.length)
    let percentInDeckByFrequency = 100 * (1 - totalNotInDeck / totalWords)


    htmlTotalWordCount.textContent = `${totalWords}`
    htmlPercentInDeck.textContent = `Words in the deck : ${percentInDeck.toFixed(2)}% (${wordData.length - topNotInDeckWords.length} / ${wordData.length})`;
    htmlPercentInDeckByFrequency.textContent = `Words in the deck by frequency : ${percentInDeckByFrequency.toFixed(2)}% (${totalWords - totalNotInDeck} / ${totalWords})`;

    let htmlNotInDeckTableData = "<tr><th>Word</th><th>Frequency</th></tr>"
    topNotInDeckWords.slice(0, 5).forEach((topWord) =>
    {
        htmlNotInDeckTableData += `<tr><td>${topWord.word}</td><td>${topWord.frequency}</td></tr>`
    })
    htmlTopWordsNotInDeck.innerHTML = htmlNotInDeckTableData

}


async function init()
{
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs: chrome.tabs.Tab[]) =>
    {
        if (tabs[0] == undefined || tabs[0].id == undefined) return;

        chrome.tabs.sendMessage(tabs[0].id, { method: "get_word_data" } as ExtensionMessage, (response: ExtensionMessage) =>
        {
            processWordStatistics(response.data)
        });
    });
}


window.onload = init
