//various data for the scripts
const statOrder = ["str", "dex", "con", "int", "wis", "cha"];
const statNames = {
	"str": "Strength",
	"dex": "Dexterity",
	"con": "Constitution",
	"int": "Intelligence",
	"wis": "Wisdom",
	"cha": "Charisma"
}
const skills = {
	"Acrobatics": "dex",
	"Animal Handling": "wis",
	"Arcana": "int",
	"Athletics": "str",
	"Deception": "cha",
	"History": "int",
	"Insight": "wis",
	"Intimidation": "cha",
	"Investigation": "int",
	"Medicine": "wis",
	"Nature": "int",
	"Perception": "wis",
	"Performance": "cha",
	"Persuasion": "cha",
	"Religion": "int",
	"Sleight of Hand": "dex",
	"Stealth": "dex",
	"Survival": "wis"
}

const moneyTypes = {
	"PP": "Platinum Pieces. Worth 10 gold pieces each.",
	"GP": "Gold Pieces.",
	"EP": "Electrum Pieces. Kind of rare. 2 make up one GP.",
	"SP": "Silver Pieces. 10 make up one GP.",
	"CP": "Copper Pieces. 10 make up one SP."
}

const moneyWorths = {
	"PP":10,
	"GP":1,
	"EP":0.5,
	"SP":0.1,
	"CP":0.01
}

const exhaustionInfo = [
	"",
	"Disadvantage on all ability checks (not attack rolls or saves)",
	"Disadvantage on all ability checks (not attack rolls or saves)\nSpeed halved",
	"Disadvantage on all ability checks, attack rolls, and saving throws\nSpeed halved",
	"Disadvantage on all ability checks, attack rolls, and saving throws\nSpeed halved\nHit point maximum halved",
	"Disadvantage on all ability checks, attack rolls, and saving throws\nHit point maximum halved\nSpeed reduced to 0",
	"Death",
]

//gets the value of an ability score from chardata and returns the bonus
function bonus(statName) {
	const score = charData.abilityScores[statName];
	return Math.floor((score - 10) / 2);
}

//turns an int into a bonus with either a + in front or a better − in front (better meaning the same width as a + for formatting)
function sign(bonus) {
	return (bonus >= 0 ? "+" + bonus : "−" + Math.abs(bonus));
}

//heals/damages
function hpModify(type) {
	const amount = document.getElementById("healDamage");
	const currentHp = document.getElementById("currentHp")
	let newHp;

	intAmount = Number(amount.value)
	currentHpVal = Number(currentHp.value)

	if (type == "heal" && currentHpVal < 0) {
		newHp = intAmount
	} else {
		newHp = currentHpVal + (type == "heal" ? intAmount : -intAmount)
	}

	currentHp.value = newHp
	amount.value = "";

	update()
}

function getSpells(type) { //accepts "always" or "preparable"
	if (!("spellList" in charData)) {
		return
	}

	const typeKey = type+"Spells"
	const spells = {}

	if (!(typeKey in charData.spellList)) {
		return
	}

	const spellDict = charData.spellList[typeKey]
	for (category in spellDict) {
		for (spellName in spellDict[category]) {
			spells[spellName] = spellDict[category][spellName]
		}
	}

	return spells
}

function clearPrevInput(element) {
	const prevInput = element.previousElementSibling
	prevInput.value = ""
	update()
}

//returns a freshly made dot checkbox element
function checkBoxDot(divClass = "", labelClass = "") {
	const dotInput = document.createElement("input")
	dotInput.type = "checkbox"
	dotInput.setAttribute("onchange", "update()")
	const dotSpan = document.createElement("span")

	const dotDiv = document.createElement("div")
	dotDiv.className = "dotCheckbox " + divClass
	dotDiv.appendChild(dotInput)
	dotDiv.appendChild(dotSpan)

	const dotLabel = document.createElement("label")
	dotLabel.className = "vcenter invis " + labelClass
	dotLabel.appendChild(dotDiv)

	return dotLabel
}

//creates an expand/contract button
function expandButton() {
	const button = document.createElement("button")
	button.innerText = "▼" //▶ ▼
	button.className = "expand"
	button.setAttribute("onclick", "panelExpand(this)")
	return button
}

function panelExpand(button) {
	const currentlyExpanded = (button.innerText == "▼")

	const panel = button.parentElement.parentElement
	const toChange = panel.getElementsByClassName("contractible")
	for (let elem of toChange) {
		elem.hidden = currentlyExpanded
	}

	button.innerText = currentlyExpanded ? "▶" : "▼"
}

//overwrites local storage with contents of the localstorage textarea
function storageOverwrite() {
	const val = document.getElementById("local").value
	const localStorageProxy = JSON.parse(val)

	localStorage.removeItem(charData.charID)
	localStorage.setItem(charData.charID, JSON.stringify(localStorageProxy))
	dataRetrieve()
	update()
}

//loads localStorage into textarea
function storageLoad() {
	const localStorageProxy = JSON.parse(localStorage.getItem(charData.charID))
	const val = JSON.stringify(localStorageProxy, null, 2)
	document.getElementById("local").value = val;
}

//shows/hides localstorage displayer
function storageVisibility() {
	const storage = document.getElementById("local")
	storage.hidden = !storage.hidden

	const button = document.getElementById("localVis")
	button.innerText = (storage.hidden ? "SHOW STORAGE" : "HIDE STORAGE")

	const overwrite = document.getElementById("localOverwrite")
	const load = document.getElementById("localLoad")
	const lock = document.getElementById("localLock")
	overwrite.hidden = storage.hidden
	load.hidden = storage.hidden
	lock.hidden = storage.hidden

	storageLoad()
}

//locks/unlocks editing of localstorage displayer
function storageLock() {
	const storage = document.getElementById("local")
	storage.disabled = !storage.disabled

	const button = document.getElementById("localLock")
	button.innerText = (storage.disabled ? "UNLOCK STORAGE" : "LOCK STORAGE")

	const overwrite = document.getElementById("localOverwrite")
	overwrite.disabled = storage.disabled
}

//switches the gridstyle sheet between the caster layout and gridstyle layout
function switchStyle() {
	const styleSheet = document.getElementById("layoutStyle")

	if (styleSheet.getAttribute("href") == "styles/gridStyle.css") {
		styleSheet.setAttribute("href", "styles/gridStyleCaster.css")
	} else {
		styleSheet.setAttribute("href", "styles/gridStyle.css")
	}
}

