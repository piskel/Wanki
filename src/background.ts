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


function segmentWords(phraseList: string[])
{
  let wordSet = new Set()
  let deconstructed:String[][] = []

  phraseList.forEach(phrase => {
    let wordList: string[] = hanzi.segment(phrase)
    deconstructed.push(wordList);

    wordList.forEach(word => {
      wordSet.add(word);
    });
  });
  console.log("Deconstructed : ", deconstructed)


  return [wordSet, deconstructed];
}


chrome.tabs.onUpdated.addListener((tabId, tabInfo, tab) =>
{
if(tabInfo.status != "complete") return;

  let port = chrome.tabs.connect(tabId)
  console.log("Connected to content script");

  port.postMessage({method:"get_phrase_list"});

  port.onMessage.addListener(message =>
    {
      console.log("Message received : ", message);

      switch (message.method) {
        case "get_phrase_list":
          let [wordSet, deconstructed] = segmentWords(message.data) as [Set<String>, String[][]]
          
          port.postMessage({method: "add_word_tags", data: deconstructed})
          
          break;
      
        default:
          break;
      }
    })


});