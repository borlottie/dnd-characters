//adds dropdowns and contractibility to all the roll20 cards
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

//adds dropdowns and contractibility to all the wikidot cards
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

// cleans up a given wikidot card
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

//expands or contracts all cards (state = "expand" or "contract")
function toggleAll(state) {
    buttonsMatch = (state == "expand") ? "▶" : "▼"

    const expandButtons = document.getElementsByClassName("expand")
    for (button of expandButtons) {
        if (button.innerText == buttonsMatch) {
            panelExpand(button)
        }
    }
}

//saves the states of all the cards on the page to localstorage
function saveFolds() {
    let buttonStates = "" //quick and dirty
    const pageName = window.location.href.split("?")[0].split("/").pop() //remove query string and keep only filename

    const expandButtons = document.getElementsByClassName("expand")
    for (button of expandButtons) {
        buttonStates += button.innerText //pushes current status in the form of its innertext
    }
    console.log(buttonStates)
    localStorage.setItem(pageName, buttonStates)
}

//loads the states of all the cards on the page from localstorage
function loadFolds() {
    const pageName = window.location.href.split("?")[0].split("/").pop() //remove query string and keep only filename
    const buttonStates = localStorage.getItem(pageName) || ""

    const expandButtons = document.getElementsByClassName("expand")
    for (let buttonNum = 0; buttonNum < expandButtons.length; buttonNum++) {
        if (expandButtons[buttonNum].innerText != buttonStates[buttonNum]) {
            panelExpand(expandButtons[buttonNum])
        }
    }
}

// Clean up all the wikidot cards
const wikiDotCards = document.getElementsByClassName("main-content")
for (card of wikiDotCards) {
    wikiDotCleanup(card)
}

// 'load' all the cards (add dropdowns)
cardsInitialLoadRoll20()
cardsInitialLoadWikiDot()

//load last saved state
loadFolds()