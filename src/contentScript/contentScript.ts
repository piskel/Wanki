
console.log("Content script started");


// TODO: Add support for returning subtags (lang+script+region)
function getISOCode()
{
    let isoCode = document.getElementsByTagName("html")[0].lang;
    let subtags = isoCode.split('-');
    return subtags[0];
}

// TODO: Move to local storage ??
let tagWhitelist = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "td", "label", "div", "span", "q"]


interface WordDetails
{
    word: string;
    isInDeck: boolean;

}

function addWordTags(segmentedSentences: string[][])
{
    let wordNo = 0
    for (let i = 0; i < segmentedSentences.length; i++)
    {
        let segmentedSentence = segmentedSentences[i]
        let sentenceElement = document.getElementById(`wanki_sentence_${i}`);

        if (sentenceElement == null) continue;

        let reconstructedSentence = ""
        segmentedSentence.forEach(word =>
        {
            reconstructedSentence += `<span class="wanki wanki_word wanki_word_${word}" id="wanki_word_${wordNo}" style="color:green !important">${word}</span>`;
            
            wordNo++;
        });
        // TODO: Error handling if the sentence tag is not found
        sentenceElement!.innerHTML = reconstructedSentence;
    }
}

// TODO: Add function to set highlighgt color to wanki word tags depending on their word  (wanki_word_<word>)

// Word highlight:
// - green: high ease
// - red: low ease
// - gray: not in deck

function preparePage()
{
    let sentenceList: string[] = []
    let sentenceNo = 0

    tagWhitelist.forEach(tagName =>
    {
        let elementList = document.body.getElementsByTagName(tagName);

        for (let i = 0; i < elementList.length; i++)
        {
            let element = elementList.item(i)
            
            if (element == null || element.children.length != 0 || element.textContent == null || element.classList.contains("wanki")) continue;

            let matches = element.textContent.match(/[\u4E00-\u9FA5]+/g)
            if (matches == null) continue;

            element.innerHTML = element.textContent.replace(/[\u4E00-\u9FA5]+/g, a => 
            {
                sentenceList[sentenceNo] = a
                let result = `<span class="wanki wanki_sentence" id="wanki_sentence_${sentenceNo}">${a}</span>`
                
                sentenceNo++;
                return result;

            });
        }
    });
    return sentenceList;
}


let port = chrome.runtime.connect({ name: "wanki" });
port.onMessage.addListener(message =>
{
    console.log("Message from background script : ", message);

    switch (message.method)
    {
        case 'segment_sentences_result':
            addWordTags(message.result)
            break;

        default:
            break;
    }
});


let sentenceList = preparePage()

port.postMessage({ method: 'segment_sentences', sentenceList: sentenceList })



