//loads spells. call once for each type of spells.
function loadSpells(type) { //type can be "preparable" and "always"
	type = type + "Spells"

	if (!(type in charData.spellList)) { //skip if this type of spells doesn't exist
		return
	}

	const spellContainer = document.getElementById("spells")
	const spells = charData.spellList[type]
	const title = document.createElement("h2")
	title.innerText = (type == "preparableSpells" ? "Preparable Spells" : "Always Spells")
	spellContainer.appendChild(title)

	for (category in spells) { //load in the spells
		const catDiv = document.createElement("div")

		const catTitle = document.createElement("h3")
		catTitle.innerText = category
		catTitle.className = "paragraph"
		spellContainer.appendChild(catTitle)

		spellContainer.appendChild(catDiv)

		for (spellTitle in spells[category]) {
			const row = document.createElement("div")
			row.className = "left compact"

			if (type == "preparableSpells") {
				const circle = document.createElement("span") //the little dot that shows preparation
				circle.className = "dot inline left";
				row.appendChild(circle)
			}

			const spell = document.createElement("p")
			spell.className = "inline compact"
			spell.innerText = spellTitle
			spell.title = spells[category][spellTitle]
			row.appendChild(spell)

			catDiv.appendChild(row)
		}
	}

	if (type != "preparableSpells") {
		return
	}

	//deal with the preparation box
	const prepBox = document.getElementById("spellPrepare")
	const amountToPrepare = charData.spellList.preparable //amount of spells that can be prepared
	const prepSpells = charData.spellList.preparableSpells

	const header = document.createElement("h3")
	header.innerText = "Prepared Spells"
	prepBox.appendChild(header)

	//make the dropdowns
	const container = document.createElement("div")
	const dataList = document.createElement("datalist")
	dataList.id = "preparableSpellList"
	container.appendChild(dataList)

	for (let slotId = 0; slotId < amountToPrepare; slotId++) {

		const dropdown = document.createElement("input")
		dropdown.autocomplete = "on"
		dropdown.setAttribute("list", "preparableSpellList")
		dropdown.setAttribute("onchange", "update()")

		container.appendChild(dropdown)

		const clearButton = document.createElement("button")
		clearButton.className = "dropdownClear"
		clearButton.setAttribute("onclick", "clearPrevInput(this)")

		const buttonText = document.createElement("span")
		buttonText.innerText = "✕"
		buttonText.className = "center"

		clearButton.appendChild(buttonText)
		container.appendChild(clearButton)
	}


	//create options
	const prepSpellList = getSpells("preparable")
	for (spellName in prepSpellList) {
		const option = document.createElement("option")
		option.innerText = spellName
		dataList.appendChild(option)
	}
	prepBox.appendChild(container)
}

function initialLoad() {
	//name
	const charName = document.getElementById("charName");
	charName.innerHTML = charData.name;

	//stylesheet
	const styleSheetName = "styles/gridStyle"+charData.styles.styleSheet+".css"
	const styleSheet = document.getElementById("layoutStyle")
	styleSheet.setAttribute("href", styleSheetName)

	//css vars (colours)
	const root = document.querySelector(':root');
	root.style.setProperty('--accent', charData.styles.accentColour || "black");
	root.style.setProperty('--background', charData.styles.backgroundColour || "white")
	root.style.setProperty('--lightBackground', charData.styles.lighterBackgroundColour || "white")
	root.style.setProperty('--text', charData.styles.textColour || "black")
	root.style.setProperty('--farBackground', charData.styles.backgroundImage || "white")

	//page title
	const pageTitle = document.getElementById("pageTitle")
	pageTitle.innerHTML = charData.pageTitle || "Unknown Character Sheet"

	//basics
	for (item in charData.basics) {
		const parentDiv = document.getElementById(item);
		const myLabel = parentDiv.children[0];

		const itemText = document.createElement("p");
		itemText.className = "big";
		itemText.innerHTML = charData.basics[item];

		parentDiv.insertBefore(itemText, myLabel);

	}

	//main stats
	const statTable = document.getElementById("mainstats");

	for (stat of statOrder) {
		const title = document.createElement("h2") //title (stat abbreviation)
		title.innerText = stat

		const score = charData.abilityScores[stat] //score (the little number ayt the bottom)
		const scoreText = document.createElement("h4")
		scoreText.innerText = "(" + score + ")"

		const bonusText = document.createElement("p"); //bonus
		bonusText.className = "huge";
		bonusText.innerText = (sign(bonus(stat)));

		const holder = document.createElement("div") //the div that holds it all
		holder.appendChild(title)
		holder.appendChild(bonusText)
		holder.appendChild(scoreText)

		const element = document.createElement("td") //the td to go in the tr (tds unecessary - just trs would've worked. but not gonna change now.)
		element.className = "outline stat center"
		element.appendChild(holder)

		const row = document.createElement("tr") //each td has its own row
		row.appendChild(element)

		statTable.appendChild(row)
	}

	//proficiency bonus
	const profBonusText = document.getElementById("profBonus");
	const profBonusVal = charData.miscData.profBonus
	profBonusText.innerText = sign(profBonusVal)

	//saves
	const saveTable = document.getElementById("saves");
	for (stat of statOrder) {
		const circle = document.createElement("span") //the little dot that shows proficiency
		circle.className = "dot inline left";

		let saveBonus = bonus(stat);

		if (charData.saveProfs.includes(stat)) { //if proficiency - fill in dot and increase bonus
			circle.classList.add("filled")
			saveBonus += charData.miscData.profBonus;
		}

		const bonusText = document.createElement("p"); //bonus 
		bonusText.innerText = sign(saveBonus)
		bonusText.className = "inline left big"

		const saveLabel = document.createElement("p"); //the stat's name
		saveLabel.innerHTML = statNames[stat];
		saveLabel.className = "inline left"

		const row = document.createElement("tr"); //the row. no tds this time (unnecessary)
		row.className = "left compact"
		row.appendChild(circle)
		row.appendChild(bonusText)
		row.appendChild(saveLabel)

		//create and add an advantage marker if relevant
		for (adv of charData.advantages) {
			if (adv.type == "save" && adv.stat.toLowerCase() == stat.toLowerCase()) { //if this save has adv
				const advbox = document.createElement("span") //create the diamond
				advbox.className = "advbox"

				const advletter = document.createElement("span") //create the letter
				advletter.className = "advletter"
				advletter.innerText = (adv.disadvantage ? "D" : "A")

				const advcontainer = document.createElement("div") //create the container 
				advcontainer.className = "advcontainer"
				advcontainer.title = adv.hover

				if (adv.disadvantage) { //if disadvantage - red box, slight adjustment of letter placement
					advbox.classList.add("disadv")
				}

				advcontainer.appendChild(advbox)
				advcontainer.appendChild(advletter)

				row.appendChild(advcontainer)
			}
		}

		saveTable.appendChild(row)
	}

	//skills
	const skillTable = document.getElementById("skills");
	for (skill in skills) {
		const circle = document.createElement("span") //the little dot that shows proficiency
		circle.className = "dot inline left";

		const baseAbility = skills[skill];
		let skillBonus = bonus(baseAbility);

		if (charData.skillProfs.includes(skill.toLowerCase())) { //if proficiency - fill in dot and increase bonus
			circle.classList.add("filled")
			skillBonus += charData.miscData.profBonus;
		}

		if (charData.skillExpertise.includes(skill.toLowerCase())) { //expertise
			circle.classList.add("circled")
			circle.classList.add("filled")
			skillBonus = bonus(baseAbility) + (charData.miscData.profBonus * 2)
		}

		const bonusText = document.createElement("p"); //bonus 
		bonusText.innerText = sign(skillBonus)
		bonusText.className = "inline left big"

		const skillLabel = document.createElement("p"); //the skill's name
		skillLabel.innerText = skill;
		skillLabel.className = "inline left"

		const skillCat = document.createElement("h4"); //the skill's base ability
		skillCat.innerText = "(" + skills[skill] + ")";
		skillCat.className = "inline left small invis underlap"

		const row = document.createElement("tr"); //the row. no tds this time (unnecessary)
		row.className = "left compact"
		row.appendChild(circle)
		row.appendChild(bonusText)
		row.appendChild(skillLabel)
		row.appendChild(skillCat)

		//create and add an advantage marker if relevant

		for (adv of charData.advantages) {
			if (adv.type == "skill" && adv.skill.toLowerCase() == skill.toLowerCase()) { //if this save has adv
				const advbox = document.createElement("span") //create the diamond
				advbox.className = "advbox"

				const advletter = document.createElement("span") //create the letter
				advletter.className = "advletter"
				advletter.innerText = (adv.disadvantage ? "D" : "A")

				const advcontainer = document.createElement("div") //create the container 
				advcontainer.className = "advcontainer"
				advcontainer.title = adv.hover

				if (adv.disadvantage) { //if disadvantage - red box, slight adjustment of letter placement
					advbox.classList.add("disadv")
				}

				advcontainer.appendChild(advbox)
				advcontainer.appendChild(advletter)

				row.appendChild(advcontainer)
			}
		}


		skillTable.appendChild(row)
	}

	//passive perception
	const passPercText = document.getElementById("passPerc");
	const passPercVal = charData.miscData.passivePerception
	passPercText.innerText = passPercVal

	//death saves
	const deathSuccs = document.getElementById("deathSucc");
	const deathFails = document.getElementById("deathFail");
	const deathParent = deathFails.parentElement;

	//insert 3 checkboxes into each
	for (let i = 0; i < 6; i++) {
		const dotLabel = checkBoxDot(divClass = "paragraph", labelClass = "inline"); //the div (circle maker) has class paragraph
		deathParent.insertBefore(dotLabel, (i < 3 ? deathSuccs : deathFails));
	}

	//other proficiencies

	const otherProfs = document.getElementById("otherProfs")
	for (category in charData.otherProfs) {
		const heading = document.createElement("h3")
		heading.innerText = category

		const desc = document.createElement("p")
		desc.innerText = charData.otherProfs[category]

		const container = document.createElement("div")
		container.className = "paragraph"
		container.appendChild(heading)
		container.appendChild(desc)

		otherProfs.appendChild(container)
	}


	//#region AC init and speed
	const ac = document.getElementById("ac")
	ac.innerText = charData.miscData.ac

	const init = document.getElementById("init")
	init.innerText = sign(charData.miscData.init)


	const speed = document.getElementById("speed")
	speed.innerText = charData.miscData.speed

	//hover for ac, init and speed
	const acContainer = document.getElementsByClassName("iac")[0]
	acContainer.title = charData.miscData.acHover

	const initContainer = document.getElementsByClassName("iinit")[0]
	initContainer.title = charData.miscData.initHover

	const speedContainer = document.getElementsByClassName("ispeed")[0]
	speedContainer.title = charData.miscData.speedHover
	//#endregion

	//#region health
	//hp
	const centredWidth = charData.health.maxHp.toString().length + 1
	const maxHp = document.getElementById("maxHp")
	maxHp.innerText = charData.health.maxHp
	maxHp.style.width = centredWidth + "ch"

	const currentHp = document.getElementById("currentHp")
	currentHp.style.width = centredWidth + "ch"

	//temp hp width
	const tempHp = document.getElementById("tempHp")

	//heal/damage form width
	const healDamage = document.getElementById("healDamage")

	//hit dice
	const hitArray = charData.health.hitDice;
	const hitDice = document.getElementById("hitDice")

	for (let dice of hitArray) {
		//for every dice (e.g. "2d12") parse it and make a list entry w/ checkboxes
		const number = parseInt(dice.split("d")[0]);

		const label = document.createElement("p")
		label.innerText = dice
		label.className = "inline"

		const container = document.createElement("div")
		container.className = "left compact vcenter";
		container.appendChild(label);

		for (let i = 0; i < number; i++) {
			const checkBox = checkBoxDot();
			container.appendChild(checkBox)
		}
		//render checkboxes and put each kind on a new line etc
		hitDice.appendChild(container)
	}

	//defenses
	const defenseList = charData.defenses;
	const defenseContainer = document.getElementById("defenses");
	const defenseHovers = {
		"advantage": "Advantage against all relevant saving throws",
		"immunity": "Any relevant damage is reduced to 0",
		"resistance": "Any relevant damage is halved (round down). This is applied after any other damage modifiers.",
		"vulnerability": "Any relevant damage is doubled. This is applied after any other damage modifiers."
	}

	for (let defense of defenseList) {
		const text = document.createElement("p");
		text.innerText = defense.text
		text.className = "left paragraph"

		const type = defense.type.toLowerCase()

		switch (type) {
			case "advantage":
			case "resistance":
			case "immunity":
				text.title = defenseHovers[type];
				break;

			case "custom":
				text.title = defense.hover;
				break;

			default:
				console.log("uh oh! invalid defense type found");
				break;
		}

		defenseContainer.appendChild(text)
	}

	//conditions
	const exhaustionDiv = document.getElementById("exhaustion")
	for (let i = 0; i<6; i++) {
		const input = checkBoxDot();
		exhaustionDiv.appendChild(input)
	}

	//#endregion

	//expendables
	const expendablesContainer = document.getElementById("expendables")
	for (let category in charData.expendables) {
		const exp = charData.expendables[category]
		const row = document.createElement("div")
		row.className = "left compact vcenter"

		const title = document.createElement("p")
		title.innerText = category
		title.className = "inline"
		row.appendChild(title)

		if (exp.type == "form" || exp.type == "counter") { //if it has a form
			const numberInput = document.createElement("input")
			numberInput.type = "number"
			numberInput.className = "expendable"
			numberInput.setAttribute("onchange", "update()")
			row.appendChild(numberInput)
		}

		if (exp.type == "form") { //if it has a max as a text element
			const max = document.createElement("p")
			max.innerText = "/ " + exp.max
			max.className = "inline"
			row.appendChild(max)
		}

		if (exp.type == "dot") { // checkboxes
			for (let i = 0; i < exp.amount; i++) {
				const dot = checkBoxDot()
				row.appendChild(dot)
			}
		}

		const refresh = document.createElement("p")
		refresh.innerText = " / "+exp.replenish
		refresh.className = "inline"
		row.appendChild(refresh);
		expendablesContainer.appendChild(row)
	}

	//actions
	const actionsTable = document.getElementById("actions");
	const proficiency = charData.miscData.profBonus;
	const spellBonus = bonus(charData.miscData.spellStat)

	for (let action of charData.actions) {
		const row = document.createElement("tr");

		if ("type" in action) {
			const name = document.createElement("td"); //action name
			const nameText = document.createElement("p");
			nameText.innerText = action.name;
			name.appendChild(nameText)

			const bonusCell = document.createElement("td"); //attack bonus / save
			const bonusText = document.createElement("p");

			if (action.type == "weapon") {
				//work out to hit based on bonus for relevant stat and prof bonus
				const toHit = bonus(action.ability) + (action.proficiency ? proficiency : 0)
				bonusText.innerText = sign(toHit)

			} else if (action.type == "spell") {
				//use to hit from spell attack bonus
				const toHit = spellBonus + proficiency;
				bonusText.innerText = sign(toHit)

			} else if (action.type == "save") {
				//work out save with 8+proficiency+spell stat bonus
				const saveDc = 8 + proficiency + spellBonus
				const saveType = action.saveType.toUpperCase();
				bonusText.innerText = saveType + " " + saveDc;
			}
			bonusCell.appendChild(bonusText)

			const damage = document.createElement("td");
			const damageText = document.createElement("p")

			//format damage as (dice)+(mod + relevant stat bonus for weapon attacks) (type)
			//if there are no damage dice or no modifier it leaves them out
			let damageMod = action.damageMod;
			if (action.type == "weapon") {
				damageMod += bonus(action.ability)
			}
			let damageStr = action.damageDice
			if (damageMod != 0) {
				if (action.damageDice != "") { damageStr += " + " }
				damageStr += damageMod
			}
			damageStr += " " + action.damageType
			damageText.innerText = damageStr
			damage.appendChild(damageText)

			row.appendChild(name)
			row.appendChild(bonusCell)
			row.appendChild(damage)
			row.title = action.hover;
		} else { //simpler actions below
			const desc = document.createElement("p")
			desc.innerText = action.desc

			const cell = document.createElement("td")
			cell.appendChild(desc)
			cell.colSpan = 3;

			row.appendChild(cell)
			row.title = action.hover
		}

		actionsTable.appendChild(row)
	}

	//money
	const moneyContainer = document.getElementById("money");
	const moneyReporter = document.getElementById("moneyReporter");

	for (let type in moneyTypes) {
		const holder = document.createElement("div")
		holder.className = "outline compact"

		const form = document.createElement("input")
		form.type = "number"
		form.className = "big"
		form.style.width = "4.8ch"
		form.setAttribute("onchange", "update()")

		const label = document.createElement("h4")
		label.innerText = type

		holder.appendChild(form)
		holder.appendChild(label)
		holder.title = moneyTypes[type]
		moneyContainer.insertBefore(holder, moneyReporter)
	}

	//equipment
	const equipContainer = document.getElementById("equipment")
	for (let item of charData.equipment) {
		const row = document.createElement("div")
		row.className = "left compact vcenter"

		//get item's name and hover - either a string element in the list, or the name key of a dict element
		let itemName, itemHover;
		if (typeof(item) == "string") {
			itemName = item
			itemHover = ""
		} else {
			itemName = item.name
			itemHover = item.hover || ""
		}

		//indents
		const spacesRemoved = itemName.trimLeft()
		const startSpaces = itemName.length - spacesRemoved.length
		for (let i = 0; i<startSpaces; i++) {
			const indent = document.createElement("div")
			indent.className = "indent inline"
			row.appendChild(indent)
		}

		// if item has attunement
		if (typeof(item) == "object" && item.attunement) {
			const attunementBox = checkBoxDot()
			row.appendChild(attunementBox)
		}

		//p element for normal equipment, h4 element if it seems to be a header (ends in a colon)
		const text = document.createElement(itemName.at(-1) == ":" ? "h4" : "p")
		text.innerText = itemName
		text.className = "inline"

		row.appendChild(text)
		row.title = itemHover || ""

		if (typeof(item) == "object" && "consumable" in item) {
			if (item.consumable == "yes") {
				const amount = document.createElement("input")
				amount.type = "number"
				amount.style.width = "4ch"
				amount.className = "equipAmount";
				amount.setAttribute("onchange", "update()")
				row.appendChild(amount)

			} else if (item.consumable == "no") {
				const amount = document.createElement("p")
				amount.innerText = item.amount
				amount.className = "equipAmount inline"
				row.appendChild(amount)

			} else if (item.consumable == "semi") {
				const amount = document.createElement("input")
				amount.type = "number"
				amount.style.width = "4ch"
				amount.className = "equipAmount";
				amount.setAttribute("onchange", "update()")
				row.appendChild(amount)
				
				const max = document.createElement("p")
				max.innerText = "/ " + item.max
				max.className = "equipAmount inline"
				row.appendChild(max)

			}
		}
		equipContainer.appendChild(row)
	}

	//details
	const detailsContainer = document.getElementById("personality");

	if ("appearanceUrl" in charData.details) {
		const image = document.createElement("img");
		image.src = charData.details.appearanceUrl;
		image.id = "headshot"
		detailsContainer.appendChild(image)
	}

	const detailsTitle = document.createElement("h2")
	detailsTitle.innerText = "Character Details"
	detailsContainer.appendChild(detailsTitle)

	for (category in charData.details) {
		if (category != "appearanceUrl") {
			const catTitle = document.createElement("h3")
			catTitle.innerText = category

			const catDesc = document.createElement("p")
			catDesc.innerText = charData.details[category]

			const catDiv = document.createElement("div")
			catDiv.className = "paragraph"
			catDiv.appendChild(catTitle)
			catDiv.appendChild(catDesc)

			detailsContainer.appendChild(catDiv)
		}
	}

	//generate features list
	const featureContainer = document.getElementById("features");

	for (let category in charData.features) {
		const categoryTitle = document.createElement("h2"); //category heading
		categoryTitle.innerText = category;
		if (featureContainer.children.length > 0) {
			categoryTitle.className = "paragraph"
		}

		featureContainer.appendChild(categoryTitle)

		if (Array.isArray(charData.features[category])) { //category heading is a list of features
			for (let feature of charData.features[category]) {

				const featureTitle = document.createElement("h3"); //feature heading
				featureTitle.innerText = feature.title;

				const featureDesc = document.createElement("p"); //description
				featureDesc.innerText = feature.desc;

				const featureDiv = document.createElement("div"); //container
				featureDiv.className = "paragraph";
				featureDiv.title = feature.hover;

				featureDiv.appendChild(featureTitle)
				featureDiv.appendChild(featureDesc)
				featureContainer.appendChild(featureDiv);
			}
		} else { //category heading is just the heading for 1 feature
			const feature = charData.features[category]

			const featureDesc = document.createElement("p"); //description
			featureDesc.innerText = feature.desc;
			featureDesc.title = feature.hover;

			categoryTitle.title = feature.hover

			featureContainer.appendChild(featureDesc)
		}

		const spacer = document.createElement("div")
		spacer.className = "spacer";
		featureContainer.appendChild(spacer)
	}

	//#region notes
	const notesContainer = document.getElementById("notes");
	console.log(notesContainer)
	const notes = charData.notes

	//the title and expand/contract button
	const mainHeading = document.createElement("h1")
	mainHeading.innerText = "Other Notes"

	const expandableButton =  expandButton()
	const titleContainer = document.getElementById("notestitle")
	titleContainer.appendChild(expandableButton)
	titleContainer.appendChild(mainHeading)

	for (let heading in notes) {
		const headingEl = document.createElement("h2")
		headingEl.innerText = heading

		if (typeof(notes[heading]) == "string") { 
			//it's a heading with a straight description
			const paraContainer = document.createElement("div")

			paraContainer.appendChild(headingEl)

			if (notes[heading] == "[field]") {
				const textField = document.createElement("textarea")
				textField.setAttribute("oninput", "update()")
				paraContainer.appendChild(textField)
			} else {
				const description = document.createElement("p")
				description.innerText = notes[heading]
				paraContainer.appendChild(description)
			}

			notesContainer.appendChild(paraContainer)

		} else {
			//its a heading with more headings
			notesContainer.appendChild(headingEl) //add the heading on its own

			for (let subheading in notes[heading]) {
				const container = document.createElement("div")
				container.className = "paragraph"

				const subheadingEl = document.createElement("h3")
				subheadingEl.innerText = subheading
				container.appendChild(subheadingEl)

				if (notes[heading][subheading] == "[field]") {
					const textField = document.createElement("textarea")
					textField.setAttribute("oninput", "update()")
					container.appendChild(textField)

				} else {
					const description = document.createElement("p")
					description.innerText = notes[heading][subheading]
					container.appendChild(description)
				}

				notesContainer.appendChild(container)
			}
		}

		const spacer = document.createElement("div")
		spacer.className = "spacer"
		notesContainer.appendChild(spacer)
	}
	//#endregion


	//spell list(s)
	if ("spellList" in charData) {
		loadSpells("always")

		if ("preparableSpells" in charData.spellList && "alwaysSpells" in charData.spellList) {
			const spacer = document.createElement("div")
			spacer.className = "spacer"
			const spellContainer = document.getElementById("spells")
			spellContainer.appendChild(spacer)
		}

		loadSpells("preparable")

		if (!("preparableSpells" in charData.spellList)) {
			const prepBox = document.getElementById("spellPrepare")
			prepBox.hidden = true
		}

		const spellStats = document.getElementById("spellStats")
		const titles = spellStats.getElementsByTagName("div")

		const spellStat = charData.miscData.spellStat

		const labelVals = [
			spellStat.toUpperCase(), //spell stat
			8 + charData.miscData.profBonus + bonus(spellStat), //save DC
			sign(bonus(spellStat) + charData.miscData.profBonus) //attack bonus
		]

		for (let i = 0; i < 3; i++) {
			const label = document.createElement("p")
			label.className = "huge paragraph"
			label.innerText = labelVals[i]

			titles[i].appendChild(label)
		}


	} else {
		const prepBox = document.getElementById("spellPrepare")
		prepBox.hidden = true

		const spellListBox = document.getElementById("spells")
		spellListBox.hidden = true

		const spellStatBox = document.getElementById("spellStats")
		spellStatBox.hidden = true
	}
}


//script
// initialLoad()
// dataRetrieve()
// update()
