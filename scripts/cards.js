function cardsInitialLoadRoll20() {
    const cards = document.getElementsByClassName("listResult booktemplate closed single expansion0")
    for (let card of cards) {
        const nameDiv = card.getElementsByClassName("name")[0]
        const dropdownArrow = expandButton()
        
        const firstEl = nameDiv.firstElementChild
        nameDiv.insertBefore(dropdownArrow, firstEl)

        const hideableDivs = card.getElementsByClassName("body")[0].getElementsByTagName("div")
        for (let div of hideableDivs) {
            if (!div.classList.contains("name"))
            div.classList.add("contractible")
        }
    }
}

function cardsInitialLoadWikiDot() {
    const cards = document.getElementsByClassName("main-content")
    for (let card of cards) {
        const nameDiv = card.getElementsByClassName("page-title")[0]
        const dropdownArrow = expandButton()
        
        const firstEl = nameDiv.firstElementChild
        nameDiv.insertBefore(dropdownArrow, firstEl)

        const hideableSection = nameDiv.nextElementSibling
        hideableSection.classList.add("contractible")
    }
}

function wikiDotCleanup(card) {
    const adLoaders = card.getElementsByClassName("wd-adunit wd-ad-np")
    for (div of adLoaders) {
        const script = div.nextElementSibling;
        script.remove()
        div.remove()
    }

    const thisContent = card.getElementsByClassName("page-title")[0].nextElementSibling

    while (thisContent.nextElementSibling) {
        thisContent.nextElementSibling.remove()
    }

    const spellLists = thisContent.lastElementChild.previousElementSibling
    spellLists.remove()
}


const wikiDotCards = document.getElementsByClassName("main-content")
for (card of wikiDotCards) {
    wikiDotCleanup(card)
}


cardsInitialLoadRoll20()
cardsInitialLoadWikiDot()