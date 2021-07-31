import { INIT_WANKI_CONFIG } from "./config";
import { ExtensionMessage, WankiConfiguration } from "./typedef";
import Wanki from "./wanki";
console.log("Background script started")

var wanki: Wanki;
var storageCache: { [name: string]: any }



chrome.runtime.onInstalled.addListener(() =>
{
  chrome.storage.sync.clear(); // WARNING!!! This might require the user to reenter their info after every update
  chrome.storage.sync.set(INIT_WANKI_CONFIG);


  chrome.contextMenus.create({'title':"Add word to Anki", "id":"add_to_anki", contexts:["selection"]});

});

chrome.contextMenus.onClicked.addListener((info, tab)=>
{
  if(info.menuItemId != "add_to_anki" || info.selectionText == undefined) return;

  wanki.addWordToDeck(info.selectionText);

});


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
      // TODO: Get language from content script
      let processed = await wanki.processSentences(message.data, "zh")
      port.postMessage({ method: 'process_sentences_result', data: processed } as ExtensionMessage)
      
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
    
    wanki = new Wanki(storageCache.ankiConnect.hostname, storageCache.ankiConnect.port, storageCache.deckList)

    chrome.runtime.onConnect.addListener(onConnectListener);
  });
}


backgroundScriptInit();
