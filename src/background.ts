import { AnkiRequest, WankiConfiguration } from "./typedef";
import AnkiController from "./utils/ankiControler";
import Wanki from "./wanki";

console.log("Background script started")
var hanzi = require('hanzi');
hanzi.start()


var storageCache: WankiConfiguration


// Default configuration
let initialConfiguration: WankiConfiguration =
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },
  deck:
  {
    name: "xiehanzi HSK 3.0",
    frontField: "Traditional"
  }
}

// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() =>
{
  chrome.storage.sync.clear(); // WARNING!!! This might require the user to reenter their info after every update
  chrome.storage.sync.set(initialConfiguration);
});


/**
 * Converts a list of sentences to an array and a set of words.
 * @param sentenceList 
 * @returns An array of deconstructed sentences and the set of all the words in all of them.
 */
function processSentences(sentenceList: string[])
{
  let deconstructed: string[][] = []
  let wordSet: Set<string> = new Set()

  sentenceList.forEach(sentence =>
  {
    let wordList: string[] = hanzi.segment(sentence)
    deconstructed.push(wordList);

    wordList.forEach(word => {
      wordSet.add(word);
    });

  });
  return {deconstructed, wordSet};
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
    case 'process_sentences':
      let processed = processSentences(message.sentenceList)

      let wordInfos = await AnkiController.findAllWordsInfosInDeckAsync(processed.wordSet, storageCache.deck.name, storageCache.deck.frontField)
      console.log(storageCache)

      port.postMessage({ method: 'process_sentences_result', result: processed.deconstructed })
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
  // chrome.storage.sync.clear()
  chrome.storage.sync.get(null, async (result) =>
  {
    storageCache = result as WankiConfiguration;
    chrome.runtime.onConnect.addListener(onConnectListener);
  });
}


backgroundScriptInit();

