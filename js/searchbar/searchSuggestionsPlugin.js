var ddgAttribution = "Results from DuckDuckGo",
	bangRegex = /!\w+/g;

//cache duckduckgo bangs so we make fewer network requests
var cachedBangSnippets = {};

//format is {bang: count}
var bangUseCounts = JSON.parse(localStorage.getItem("bangUseCounts") || "{}");

function incrementBangCount(bang) {
	//increment bangUseCounts

	if (bangUseCounts[bang]) {
		bangUseCounts[bang]++;
	} else {
		bangUseCounts[bang] = 1;
	}

	//prevent the data from getting too big

	if (bangUseCounts[bang] > 1000) {
		for (var bang in bangUseCounts) {
			bangUseCounts[bang] = Math.floor(bangUseCounts[bang] * 0.9);

			if (bangUseCounts[bang] < 2) {
				delete bangUseCounts[bang];
			}
		}
	}
}

var saveBangUseCounts = debounce(function () {
	localStorage.setItem("bangUseCounts", JSON.stringify(bangUseCounts));
}, 10000);

function showSearchSuggestions(text, input, event, container) {
	if (searchbarResultCount > 3) {
		empty(container);
		return;
	}

	fetch("https://ac.duckduckgo.com/ac/?t=min&q=" + encodeURIComponent(text), {
			cache: "force-cache"
		})
		.then(function (response) {
			return response.json();
		})
		.then(function (results) {

			empty(container);

			if (results && results[0] && results[0].snippet) { //!bang search - ddg api doesn't have a good way to detect this

				results.sort(function (a, b) {
					var aScore = a.score || 1;
					var bScore = b.score || 1;
					if (bangUseCounts[a.phrase]) {
						aScore *= bangUseCounts[a.phrase];
					}
					if (bangUseCounts[b.phrase]) {
						bScore *= bangUseCounts[b.phrase];
					}

					return bScore - aScore;
				});

				results.slice(0, 5).forEach(function (result) {
					cachedBangSnippets[result.phrase] = result.snippet;

					//autocomplete the bang, but allow the user to keep typing

					var data = {
						iconImage: result.image,
						title: result.snippet,
						secondaryText: result.phrase
					}

					var item = createSearchbarItem(data);

					item.addEventListener("click", function () {
						setTimeout(function () {
							incrementBangCount(result.phrase);
							saveBangUseCounts();

							input.value = result.phrase + " ";
							input.focus();
						}, 66);
					});

					container.appendChild(item);
				});

			} else if (results) {
				results.slice(0, 3).forEach(function (result) {

					var data = {
						title: result.phrase,
					}

					if (bangRegex.test(result.phrase)) {

						data.title = result.phrase.replace(bangRegex, "");

						var bang = result.phrase.match(bangRegex)[0];

						incrementBangCount(bang);
						saveBangUseCounts();

						data.secondaryText = "Search on " + cachedBangSnippets[bang];
					}

					if (urlParser.isURL(result.phrase) || urlParser.isURLMissingProtocol(result.phrase)) { //website suggestions
						data.icon = "fa-globe";
					} else { //regular search results
						data.icon = "fa-search";
					}

					var item = createSearchbarItem(data);

					item.addEventListener("click", function (e) {
						openURLFromsearchbar(e, result.phrase);
					});

					container.appendChild(item);
				});
			}
			searchbarResultCount += results.length;
		});
}

registerSearchbarPlugin("searchSuggestions", {
	index: 3,
	trigger: function (text) {
		return !!text && !tabs.get(tabs.getSelected()).private;
	},
	showResults: debounce(showSearchSuggestions, 150),
})
