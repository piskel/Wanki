import { AnkiRequest, WankiConfiguration } from "./typedef";
import AnkiController from "./utils/ankiControler";
import Wanki from "./wanki";

console.log("Background script started")
var hanzi = require('hanzi');
hanzi.start()


var storageCache: WankiConfiguration


// TODO: Make interface for configuration

// Default configuration
let initialConfiguration: WankiConfiguration =
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },
  deckName: "Wanki"
  // mappedDecks:{}, // Will map decks to their respective languages
}

// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() =>
{
  chrome.storage.sync.set({ config: initialConfiguration });
});


/**
 * Segments Chinese sentences into words
 * @param sentenceList List of Chinese sentences
 * @returns An array of segmented sentences
 */
function segmentSentences(sentenceList: string[])
{
  let deconstructed: string[][] = []

  sentenceList.forEach(sentence =>
  {
    let wordList: string[] = hanzi.segment(sentence)
    deconstructed.push(wordList);

  });
  return deconstructed;
}

function segmentedToSet(segmentedSentences:string[][])
{
  let wordSet: Set<string> = new Set()
  segmentedSentences.forEach(sentence => {
    sentence.forEach(word => {
      wordSet.add(word);
    });
  });
  return wordSet;
}


/**
 * The onMessage listener for the background script
 * @param message Message received
 * @param port Port on which the message was received
 */
async function messageListener(message: any, port: chrome.runtime.Port)
{
  console.log("Message from content script : ", message);

  switch (message.method)
  {
    case 'segment_sentences':
      let segmentedSentences = segmentSentences(message.sentenceList)

      let wordSet = segmentedToSet(segmentedSentences);
      console.log(wordSet)

      console.log(await AnkiController.findAllWordsInDeckAsync(wordSet, "xiehanzi HSK 3.0", "Traditional"));

      port.postMessage({ method: 'segment_sentences_result', result: segmentedSentences })
      break;

    default:
      break;
  }
}

/**
 * The onConnect listener for the background script.
 * @param port 
 */
async function onConnectListener(port: chrome.runtime.Port)
{
  console.log("Connected to content script.");
  port.onMessage.addListener(messageListener);
}

/**
 * Initializes the background script
 */
function backgroundScriptInit()
{
  chrome.storage.sync.get(null, async (result) =>
  {
    storageCache = result as WankiConfiguration;
    chrome.runtime.onConnect.addListener(onConnectListener);
  });
}


backgroundScriptInit();

