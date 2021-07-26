import { IsoLanguage, WankiConfiguration } from "./typedef";

export let ANKI_CONNECT_VERSION = 6;

export let SUPPORTED_LANGUAGES: IsoLanguage[] = [
    "zh"
]

export let TAG_WHITELIST = [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "td", "label", "div", "span", "q"
]

export let INIT_WANKI_CONFIG: WankiConfiguration =
{
  ankiConnect:
  {
    hostname: "localhost",
    port: "8765"
  },
  deckList:
  {
    "zh":
    {
      name: "xiehanzi HSK 3.0",
      language:"zh",
      field:"Traditional"
    }
  }
}