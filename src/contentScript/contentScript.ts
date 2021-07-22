
console.log("Content script started");

// TODO: Add support for returning subtags (lang+script+region)
function getISOCode()
{
    let isoCode = document.getElementsByTagName("html")[0].lang;
    let subtags = isoCode.split('-');
    return subtags[0];
}

function getWordList()
{
    let fullTextRaw = document.body.innerText;
    
    // TODO: Find chinese word segmentation library
    // 
    let fullTextFiltered = fullTextRaw.match(/[\u4E00-\u9FA5]+/g);
    
    return fullTextFiltered;
}

function addWordTags()
{
    let innerHTML = document.body.innerHTML;

    

    document.body.innerHTML = innerHTML
}

console.log(getWordList());

// addWordTags();
