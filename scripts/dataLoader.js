const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);

		const charDataFileName = urlParams.get('src') || "template"
		const charDataPath = "characters/" + charDataFileName + ".json"

		fetch(charDataPath)
			.then((response) => response.json()) // and the response we get is in json format
			.then((data) => {
				// we call that data here
				charData = data;
				console.log(charData)
				initialLoad()
				dataRetrieve()
				update()
			});