console.log("Background script started")
import AnkiController from "./utils/ankiControler";
var hanzi = require('hanzi');
hanzi.start()




// Default configuration
let initialConfiguration =
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },
  deckName: ""
  // mappedDecks:{}, // Will map decks to their respective languages
}

var storageCache = {}



// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() =>
{
  chrome.storage.sync.set({ config: initialConfiguration });
});

chrome.windows.onRemoved.addListener

/**
 * Segments Chinese sentences into words
 * @param sentenceList List of Chinese sentences
 * @returns An array of segmented sentences
 */
function segmentSentences(sentenceList: string[])
{
  let deconstructed: String[][] = []

  sentenceList.forEach(sentence =>
  {
    let wordList: string[] = hanzi.segment(sentence)
    deconstructed.push(wordList);

  });
  return deconstructed;
}

function getWordsEase(wordList: string[])
{

}


function messageListener(message: any, port: chrome.runtime.Port)
{
  console.log("Message from content script : ", message);

  switch (message.method)
  {
    case 'segment_sentences':
      let segmentedSentences = segmentSentences(message.sentenceList)
      port.postMessage({ method: 'segment_sentences_result', result: segmentedSentences })
      break;

    default:
      break;
  }
}

function onConnectListener(port: chrome.runtime.Port)
{
  console.log("Connected to content script.");
  port.onMessage.addListener(messageListener);
}


function init()
{
  chrome.storage.sync.get(null, (result) =>
  {
    storageCache = result;

    chrome.runtime.onConnect.addListener(onConnectListener);
  });
}


init();

AnkiController.findWordInDeck("*", "xiehanzi HSK 3.0::HSK 1", "Traditional", (results) =>
{
  console.log(results)
  
  AnkiController.cardsInfo(results.result, (results) =>
  {
    console.log(results)
  })
  
})