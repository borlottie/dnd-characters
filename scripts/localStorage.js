/* 
Functions that deal with localStorage
Main functions: update() and dataRetrieve()
If you're looking for the functions that deal with the localStorage displayer, they're in functions.js
*/

//save values on html page to localstorage
//run basically whenever anything changes
//data validation also happens here. invalid values get removed - they'll be returned to default during dataRetrieve()
//some defaults are also set here (for the properties which are stringified objects) mostly
function update() {
	console.log("update")
	const localStorageProxy = {}

	//localStorage before any changes are made.
	const oldlocalStorage = JSON.parse(localStorage.getItem(charData.charID)) || {} //for referencing previous state of localstorage.

	//inspiration
	const inspiration = document.getElementById("inspiration")
	localStorageProxy.inspiration = inspiration.checked

	//current hp
	const currentHp = document.getElementById("currentHp")
	let hpToSet = parseInt(currentHp.value)
	if (isNaN(hpToSet) || hpToSet > charData.health.maxHp) {
		delete localStorageProxy.currentHp //return to default
	} else {
		localStorageProxy.currentHp = hpToSet
	}

	//temp hp
	const tempHp = document.getElementById("tempHp");
	let tempHpToSet = parseInt(tempHp.value);
	if (isNaN(tempHpToSet) || tempHpToSet <= 0) {
		delete localStorageProxy.tempHp //return to default
	} else {
		localStorageProxy.tempHp = tempHpToSet
	}

	//money
	const moneyContainer = document.getElementById("money")

	for (let moneyInput of moneyContainer.getElementsByTagName("input")) {
		const moneyType = moneyInput.nextElementSibling.innerText;
		let moneyAmount = parseInt(moneyInput.value)
		const localStorageKey = "money" + moneyType

		localStorageProxy[localStorageKey] = moneyAmount
		if (moneyAmount < 0 || isNaN(moneyAmount)) {
			delete localStorageProxy[localStorageKey]
		}
	}

	//death saves
	const deathSavesContainer = document.getElementsByClassName("ideath")[0]
	const deathSaveCheckBoxes = deathSavesContainer.getElementsByTagName("label")
	const deathSaves = { "failures": 0, "successes": 0 }
	for (let boxNum = 0; boxNum < deathSaveCheckBoxes.length; boxNum++) {
		const checkBox = deathSaveCheckBoxes[boxNum].getElementsByTagName("input")[0]
		if (checkBox.checked) {
			deathSaves[(boxNum < 3 ? "successes" : "failures")] += 1
		}
	}
	localStorageProxy.deathSaveFailures = deathSaves.failures
	localStorageProxy.deathSaveSuccesses = deathSaves.successes

	//conditions
	const conditions = document.getElementById("conditions")
	localStorageProxy.conditions = conditions.value

	//exhaustion
	const exhaustion = document.getElementById("exhaustion")
	const exhaustionBoxes = exhaustion.getElementsByTagName("input")
	localStorageProxy.exhaustion = 0

	for (box of exhaustionBoxes) {
		if (box.checked) {
			localStorageProxy.exhaustion += 1
		}
	}

	//#region equipment
	//construct an array of equip values, then stringify and save to localstorage
	const equipmentContainer = document.getElementById("equipment")
	const equipmentInputs = equipmentContainer.getElementsByTagName("input")

	const equipmentTotals = {}
	// currently attuned equipment - stored in localstorageproxy as an array but converted to set for handling.
	let attunedEquipment = new Set(oldlocalStorage.attunedEquipment || [])

	for (input of equipmentInputs) {
		if (input.parentElement.parentElement != moneyContainer && input.type == "number") { //if it's not a money total

			const inputTitle = input.parentElement.getElementsByTagName("p")[0].innerText //get item name
			let inputValue = input.value //get value we want to write

			inputValue = parseInt(inputValue) //parse it as int
			inputValue = (inputValue < 0 ? 0 : inputValue) //if it's too low, fix

			//if there's a max
			const nextSib = input.nextElementSibling
			if (nextSib && nextSib.classList.contains("equipAmount")) {
				const maxAmount = parseInt(nextSib.innerText.substring(1)) || Infinity //work out what the max is
				inputValue = (inputValue > maxAmount ? maxAmount : inputValue) //if too high, reset

				//default to max if possible
				inputValue = (!inputValue && inputValue !== 0) ? maxAmount : inputValue
			}

			inputValue = inputValue || 0 //if no max - default to 0. i think this line is superfluous but it makes the code less confusing
			equipmentTotals[inputTitle] = inputValue 

		} else if (input.type == "checkbox") { //attunement checkboxes
			const inputTitle = input.parentElement.parentElement.parentElement.getElementsByTagName("p")[0].innerText //get item name
			
			if (input.checked && attunedEquipment.size < 3) { //item has just been attuned and there's space
				attunedEquipment.add(inputTitle)

			} else if (!input.checked) { //item shouldnt be attuned
				attunedEquipment.delete(inputTitle)
			}
		}
	}
	// list of attuned equipment is processed as a set but must be converted to an Array to properly go through JSON.stringify().
	localStorageProxy.attunedEquipment = Array.from(attunedEquipment)
	localStorageProxy.equipment = equipmentTotals
//#endregion

	//hit dice
	const hitDiceContainer = document.getElementById("hitDice")
	const hitDiceTotals = {}

	for (row of hitDiceContainer.children) { //for every type of hit dice
		if (row.tagName == "DIV") { //exclude header
			const rowTitle = row.firstElementChild.innerText
			const hitDiceType = "d" + rowTitle.split("d")[1]

			let amountUsed = 0
			const checkboxes = row.getElementsByTagName("input")
			for (input of checkboxes) {
				if (input.checked) {
					amountUsed += 1
				}
			}
			hitDiceTotals[hitDiceType] = amountUsed
		}
	}
	localStorageProxy.hitDice = hitDiceTotals

	//expendables
	const expendablesContainer = document.getElementById("expendables")
	const expendablesTotals = {}

	for (row of expendablesContainer.children) {
		if (row.tagName == "DIV") { //rows only !!!
			const rowTitle = row.firstElementChild.innerText

			const inputs = row.getElementsByTagName("input")
			const inputType = inputs[0].type
			const myData = charData.expendables[rowTitle]

			if (inputType == "checkbox") { //count amount of checked checkboxes
				let amountChecked = 0
				for (input of inputs) {
					if (input.checked) {
						amountChecked += 1
					}
				}
				expendablesTotals[rowTitle] = amountChecked
			}

			if (inputType == "number") {
				let amount = parseInt(inputs[0].value)
				amount = (amount === NaN ? (myData.default || 0) : amount)
				if ("max" in myData) { //if there's a max
					amount = (amount > myData.max ? myData.max : amount) //can't go over max
				}
				amount = (amount < 0 ? 0 : amount) //can't go under 0
				expendablesTotals[rowTitle] = amount
			}
		}
	}
	localStorageProxy.expendables = expendablesTotals

	//spell preparing. make sure to make it work for non-casters
	if ("spellList" in charData && "preparableSpells" in charData.spellList) {
		preparedSpells = []
		const spellPrepBox = document.getElementById("spellPrepare")
		const dropdowns = spellPrepBox.getElementsByTagName("input")
		const spellList = getSpells("preparable")

		for (dropdown of dropdowns) {
			if (dropdown.value in spellList && !(preparedSpells.includes(dropdown.value))) { //spell is preparable and not already prepared
				preparedSpells.push(dropdown.value)
			} else { //literally just remove else condition to make it auto rearrange
				//preparedSpells.push("")
			}
		}

		localStorageProxy.preparedSpells = preparedSpells
	}

	//notes
	const notesContainer = document.getElementById("notes")
	const notesTextAreas = notesContainer.getElementsByTagName("textarea")
	const notesValues = []
	for (let thisField of notesTextAreas) {
		notesValues.push(thisField.value)
	}

	localStorageProxy.notes = notesValues

	//save proxy to localstorage
	localStorage.setItem(charData.charID, JSON.stringify(localStorageProxy))
	dataRetrieve() //called so any resets to default happen
}


//retrieve from localstorage and write to html page
//handle some defaults here (for if localstorage has no value for what you want)
//run on initial loads / whenever localstorage fuckery happens
//also handle widths / other display stuff
function dataRetrieve() {
	console.log("data retrieve")
	const localStorageProxy = JSON.parse(localStorage.getItem(charData.charID)) || {}

	//inspiration
	const inspiration = document.getElementById("inspiration")
	if (localStorageProxy.inspiration == undefined) {
		inspiration.checked = false
	} else {
		inspiration.checked = localStorageProxy.inspiration
	}

	//current hp
	const currentHp = document.getElementById("currentHp")
	currentHp.value = (localStorageProxy.currentHp !== undefined ? localStorageProxy.currentHp : charData.health.maxHp)

	currentHp.style.width = currentHp.value.length + 2 + "ch"

	//temp hp
	const tempHp = document.getElementById("tempHp")
	tempHp.value = (localStorageProxy.tempHp || 0) //the "--" default is a placeholder, not a real default

	const thLen = tempHp.value.length
	tempHp.style.width = (thLen == 0 ? "3ch" : thLen + 2 + "ch") //auto width

	//heal/damage panel - just default resetting, no localstorage
	const healDamage = document.getElementById("healDamage")
	const hdVal = Number(healDamage.value)
	healDamage.value = (hdVal <= 0 ? 0 : hdVal)
	const hdLen = Number(healDamage.value.length)
	healDamage.style.width = (hdLen == 0 ? "3ch" : hdLen + 2 + "ch")

	//money
	const moneyContainer = document.getElementById("money")
	let totalMoney = 0

	for (let moneyInput of moneyContainer.getElementsByTagName("input")) {
		const moneyType = moneyInput.nextElementSibling.innerText;

		const localStorageKey = "money" + moneyType
		moneyInput.value = localStorageProxy[localStorageKey] || 0

		totalMoney += Number(moneyInput.value) * moneyWorths[moneyType]
	}
	totalMoney = Math.round(totalMoney * 100) / 100
	const moneyReporter = document.getElementById("moneyReporter")
	moneyReporter.innerText = "Total Money: " + totalMoney + " GP"

	//death saves
	const deathSavesContainer = document.getElementsByClassName("ideath")[0]
	const deathSaveCheckBoxes = deathSavesContainer.getElementsByTagName("label")

	for (let boxNum = 0; boxNum < deathSaveCheckBoxes.length; boxNum++) {
		const checkBox = deathSaveCheckBoxes[boxNum].getElementsByTagName("input")[0]

		if (boxNum < (localStorageProxy.deathSaveSuccesses || 0)) {
			checkBox.checked = true
		} else if (boxNum >= 3 && boxNum < ((localStorageProxy.deathSaveFailures || 0) + 3)) {
			checkBox.checked = true
		} else {
			checkBox.checked = false
		}
	}

	//conditions
	const conditions = document.getElementById("conditions")
	conditions.value = localStorageProxy.conditions || "" //default is ""

	//exhaustion
	const exhaustion = document.getElementById("exhaustion")
	const exhaustionBoxes = exhaustion.getElementsByTagName("input")

	for (let boxNum = 0; boxNum < exhaustionBoxes.length; boxNum++) {
		const checkBox = exhaustionBoxes[boxNum]
		checkBox.checked = (boxNum < localStorageProxy.exhaustion || 0)
	}

	exhaustion.title = exhaustionInfo[localStorageProxy.exhaustion]
	exhaustion.previousElementSibling.title = exhaustionInfo[localStorageProxy.exhaustion]

	//equipment
	const equipmentTotals = localStorageProxy.equipment || {}
	const attunedEquipArr = localStorageProxy.attunedEquipment || []
	console.log(attunedEquipArr)
	const attunedEquipment = new Set(attunedEquipArr)

	const equipmentContainer = document.getElementById("equipment")
	const equipmentInputs = equipmentContainer.getElementsByTagName("input")

	for (input of equipmentInputs) {
		if (input.parentElement.parentElement != moneyContainer && input.type == "number") { //if it's not a money total

			const inputTitle = input.parentElement.getElementsByTagName("p")[0].innerText

			let maxTotal
			for (item of charData.equipment) {
				if (typeof (item) == "object" && item.name.trimLeft() == inputTitle && item.consumable == "semi") {
					maxTotal = item.amount
				}
			}

			input.value = (!equipmentTotals[inputTitle] && equipmentTotals[inputTitle] !== 0) ? (maxTotal || 0) : equipmentTotals[inputTitle]

			const inputLen = input.value.toString().length
			input.style.width = inputLen + 3 + "ch"
		} else if (input.type == "checkbox") {
			const inputTitle = input.parentElement.parentElement.parentElement.getElementsByTagName("p")[0].innerText
			input.checked = attunedEquipment.has(inputTitle)
		}
	}

	//hit dice
	const hitDiceTotals = localStorageProxy.hitDice || {}
	const hitDiceContainer = document.getElementById("hitDice")

	for (row of hitDiceContainer.children) { //for every type of hit dice
		if (row.tagName == "DIV") { //exclude header
			const rowTitle = row.firstElementChild.innerText
			const hitDiceType = "d" + rowTitle.split("d")[1]

			amountUsed = hitDiceTotals[hitDiceType] || 0
			const checkboxes = row.getElementsByTagName("input")
			for (let boxNum = 0; boxNum < checkboxes.length; boxNum++) {
				checkboxes[boxNum].checked = boxNum < amountUsed
			}
		}
	}

	//expendables
	const expendablesContainer = document.getElementById("expendables")
	const expendablesTotals = localStorageProxy.expendables || {}

	for (row of expendablesContainer.children) {
		if (row.tagName == "DIV") { //rows only !!!
			const rowTitle = row.firstElementChild.innerText

			const inputs = row.getElementsByTagName("input")
			const inputType = inputs[0].type
			const myData = charData.expendables[rowTitle]
			let inputValue = expendablesTotals[rowTitle]
			inputValue = (!inputValue && inputValue !== 0) ? (myData.default || 0) : inputValue

			if (inputType == "checkbox") { //count amount of checked checkboxes
				for (let boxNum = 0; boxNum < inputs.length; boxNum++) {
					inputs[boxNum].checked = boxNum < inputValue
				}
			}

			if (inputType == "number") {
				inputs[0].value = inputValue
				const inputLen = inputValue.toString().length
				inputs[0].style.width = inputLen + 3 + "ch"
			}
		}
	}

	//prepared spells
	if ("spellList" in charData && "preparableSpells" in charData.spellList) {
		preparedSpells = localStorageProxy.preparedSpells || []

		const spellPrepBox = document.getElementById("spellPrepare")
		const dropdowns = spellPrepBox.getElementsByTagName("input")

		for (dropdownNum in dropdowns) {
			dropdowns[dropdownNum].value = preparedSpells[dropdownNum] || ""
		}

		const spellListContainer = document.getElementById("spells")
		const dots = spellListContainer.getElementsByClassName("dot")

		for (dot of dots) {
			const spellName = dot.nextElementSibling.innerText
			if (preparedSpells.includes(spellName)) {
				dot.classList.add("filled")
			} else {
				dot.classList.remove("filled")
			}
		}
	}

	//notes
	const notesValues = localStorageProxy.notes || []
	const notesContainer = document.getElementById("notes")
	const notesTextAreas = notesContainer.getElementsByTagName("textarea")

	for (let thisFieldNum in notesTextAreas) {
		notesTextAreas[thisFieldNum].value = notesValues[thisFieldNum] || ""
	}

	storageLoad()
}
