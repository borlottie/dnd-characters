function cardsInitialLoad() {
    const cards = document.getElementsByClassName("listResult booktemplate closed single expansion0")
    for (let card of cards) {
        console.log(card)
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

cardsInitialLoad()