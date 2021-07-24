console.log("Background script started")
var hanzi = require('hanzi');
hanzi.start()


var storageCache = {}


// TODO: Make interface for configuration

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
  let deconstructed: String[][] = []

  sentenceList.forEach(sentence =>
  {
    let wordList: string[] = hanzi.segment(sentence)
    deconstructed.push(wordList);

  });
  return deconstructed;
}

/**
 * The onMessage listener for the background script
 * @param message Message received
 * @param port Port on which the message was received
 */
function messageListener(message: any, port: chrome.runtime.Port)
{
  console.log("Message from content script : ", message);

  switch (message.method)
  {
    case 'segment_sentences':
      let segmentedSentences = segmentSentences(message.sentenceList)

      // TODO: Search for the word's ease on Anki

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
function onConnectListener(port: chrome.runtime.Port)
{
  console.log("Connected to content script.");
  port.onMessage.addListener(messageListener);
}

/**
 * Initializes the background script
 */
function init()
{
  chrome.storage.sync.get(null, (result) =>
  {
    storageCache = result;

    chrome.runtime.onConnect.addListener(onConnectListener);
  });
}


init();

