console.log("Background script started")

let hanzi = require('hanzi');
hanzi.start()


// Default configuration
let initialConfiguration = 
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },
  mappedDecks:{}, // Will map decks to their respective languages
}


// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({config: initialConfiguration});
});



function segmentSentences(phraseList: string[])
{
  let deconstructed:String[][] = []

  phraseList.forEach(phrase => {
    let wordList: string[] = hanzi.segment(phrase)
    deconstructed.push(wordList);

  });
  return deconstructed;
}


chrome.runtime.onConnect.addListener(port =>
  {
    console.log("Connected to content script.");

    port.onMessage.addListener(message =>
      {
        console.log("Message from content script : ", message);
        switch (message.method) {
          case 'segment_sentences':
            let segmentedSentences = segmentSentences(message.sentenceList)
            port.postMessage({method:'segment_sentences_result', result: segmentedSentences})
            break;
        
          default:
            break;
        }


      });

  });
