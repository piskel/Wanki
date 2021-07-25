import { AnkiRequest, CardInfo, ExtensionMessage, ProcessedSentences, WankiConfiguration, WordDetails } from "./typedef";
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
    name: "Wanki Chinese",
    frontField: "Front"
    // name: "xiehanzi HSK 3.0",
    // frontField: "Traditional"
  }
}

// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() =>
{
  chrome.storage.sync.clear(); // WARNING!!! This might require the user to reenter their info after every update
  chrome.storage.sync.set(initialConfiguration);
});



// TODO: Function too big
/**
 * Converts a list of sentences to an array and a set of words.
 * @param sentenceList 
 * @returns An array of deconstructed sentences and the set of all the words in all of them.
 */
async function processSentences(sentenceList: string[]) 
{

  let deconstructed: string[][] = []
  let wordSet: Set<string> = new Set()
  let wordData: { [key: string]: WordDetails } = {}

  //////////////////////////////////////////////////////////
  sentenceList.forEach(sentence =>
  {
    let wordList: string[] = hanzi.segment(sentence)
    deconstructed.push(wordList);

    wordList.forEach(word =>
    {
      if (wordData[word] == undefined) wordData[word] = { word: word, frequency: 0, isInDeck: false, ease: -1, type: -1, interval: 0 };

      wordData[word]['frequency'] += 1;
      wordSet.add(word);
    });
  });

  //////////////////////////////////////////////////////////

  // TODO: Find a way to do this in only one request
  let wordCardList = (await AnkiController.findAllWordsInDeckAsync(wordSet, storageCache.deck.name, storageCache.deck.frontField)).result
  let wordInfoList = (await AnkiController.cardsInfoAsync(wordCardList)).result

  console.log("Word Card List : ", wordCardList)
  console.log("Word Info List : ", wordInfoList)
  // console.log(wordInfoList)
  wordInfoList.forEach((info: CardInfo) =>
  {
    let word = info.fields[storageCache.deck.frontField].value
    if (wordData[word] != undefined){
      console.log("In deck: ", info)
      wordData[word].isInDeck = true;
      wordData[word].ease = info.factor;
      wordData[word].type = info.type;
      wordData[word].interval = info.interval;
    }
  });

  //!!!!!!!!!!!!! REPLACE WORDSET WITH WORDDATA

  console.log(wordData)

  let result: ProcessedSentences = {
    deconstructed: deconstructed,
    wordData: wordData
  }

  return result;
}


/**
 * The onMessage listener for the background script
 * @param message Message received
 * @param port Port on which the message was received
 */
async function messageListener(message: ExtensionMessage, port: chrome.runtime.Port)
{
  console.log(`Message from content : `, message);

  switch (message.method)
  {
    case 'process_sentences':
      let processed = await processSentences(message.data)
      port.postMessage({ method: 'process_sentences_result', data: processed} as ExtensionMessage)
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

