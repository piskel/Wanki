
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
  chrome.storage.sync.set(initialConfiguration);

});

// Listens for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => 
{

});
