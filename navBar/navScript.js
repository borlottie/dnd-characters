const pages = {
    "Annaline":"index.html?src=annaline",
    "Stat Blocks":"cards.html",
    "spacer1":"", //anything with a blank url is a spacer
    "Template":"index.html?src=template",
    "No Magic":"index.html?src=nomagic"
}

const placeholder = document.getElementById("navBarPlaceholder")

const stylesheet = document.createElement("link")
stylesheet.setAttribute("href", "navBar/navStyle.css")
stylesheet.setAttribute("rel", "stylesheet")
stylesheet.setAttribute("type", "text/css")

const elemUl = document.createElement("ul")
elemUl.className = "nav"

let spaceNextEl = false
for (listElem in pages) {
    if (pages[listElem] != "") {
        const elemA = document.createElement("a")
        elemA.innerText = listElem
        elemA.setAttribute("href", pages[listElem])
    
        const myUrl = document.location.href.split("/").pop()
        if (myUrl == pages[listElem]) {
            elemA.className = "active"
        }
    
        const elemLi = document.createElement("li")

        if (spaceNextEl) {
            elemLi.style.marginLeft = "50px"
            spaceNextEl = false
        }

        elemLi.appendChild(elemA)
    
        elemUl.appendChild(elemLi)
    } else {
        spaceNextEl = true
    }
}

const spacer = document.createElement("div")
spacer.style.height = "50px"

const container = document.createElement("div")
container.appendChild(stylesheet)
container.appendChild(elemUl)
container.appendChild(spacer)

placeholder.parentElement.replaceChild(container, placeholder)

