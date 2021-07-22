
// Default configuration
let initialConfiguration = 
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },

  deckName: "",
  targetLanguage:"" // 	ISO 2-digit code https://www.w3schools.com/tags/ref_language_codes.asp

}

// Event used to initialize an extension during installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set(initialConfiguration);

});

// Listens for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => 
{

});
