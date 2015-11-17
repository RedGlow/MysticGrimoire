var fs = require('fs')
,	util = require('util')
,	q = require("q")
,	_ = require('lodash')
,	csvParse = require('csv-parse')
,	request = q.denodeify(require("request"))
;

// get recipes from gw2profits

/*
{ name: 'Iron Ore',
  type: 'CraftingMaterial',
  output_item_id: 19699,
  output_item_count: 88,
  disciplines: [ 'Mystic Forge' ],
  ingredients:
   [ { item_id: 19697, count: 250 },
     { item_id: 19699, count: 1 },
     { item_id: 24273, count: 5 },
     { item_id: 20796, count: 1 } ] }
*/
var keywords =
	[
		// common
		[
			// tier 1-4
			['iron', 'gold', 'platinum', 'mithril', 'silver', 'steel',
			'soft', 'seasoned', 'hard', 'elder',
			'wool', 'cotton', 'linen', 'silk',
			'thin', 'coarse', 'rugged', 'thick',
			'shimmering', 'radiant', 'luminous', 'incandescent'],
			// tier 5
			['orichalcum', 'ancient', 'gossamer', 'hardened']
		],
		// fine
		[
			// tier 1-4
			['bone shard', 'bone', 'heavy bone', 'large bone',
			'small claw', 'claw', 'sharp claw', 'large claw',
			'small fang', 'fang', 'sharp fang', 'large fang',
			'small scale', 'scale', 'smooth scale', 'large scale',
			'small totem', 'totem', 'engraved totem', 'intricate totem',
			'small venom sac', 'venom sac', 'full venom sac', 'potent venom sac',
			'vial of thin blood', 'vial of blood', 'vial of thick blood', 'vial of potent blood'],
			// tier 5
			['ancient bone', 'vicious claw', 'crystalline', 'vicious fang', 'armored', 'elaborate', 'powerful']
		]
	]
	;
function getGw2ProfitsRecipes() {
	var url = "http://gw2profits.com/json/v2/forge/";
	return request({
		url: url,
		json: true
	}).then(function(data) {
		var response = data[0];
		if(response.statusCode !== 200) {
			throw new Error("response status code: " + response.statusCode);
		}
		var body = data[1];
		var mats = body.filter(function(value) {
			return value.type === "CraftingMaterial";
		});
		mats.forEach(function(mat) {
			var name = mat.name.toLowerCase();
			var partialMatch, fine, tier5, found = false;
			for(partialMatch = 0; partialMatch < 2; partialMatch++) {
				for(fine = 1; fine >= 0; fine--) {
					for(tier5 = 1; tier5 >= 0; tier5--) {
						var ks = keywords[fine][tier5];
						for(var k = 0; k < ks.length; k++) {
							var keyword = ks[k];
							if(!!partialMatch ? name.indexOf(keyword) !== -1 : name === keyword) {
								found = true;
								break;
							}
						};
						if(found) {
							break;
						}
					}
					if(found) {
						break;
					}
				}
				if(found) {
					break;
				}
			}
			if(found) {
				mat.fine = !!fine;
				mat.tier5 = !!tier5;
			}
			console.log(util.format("name = %s; fine = %s; tier5 = %s", _.pad(mat.name, 40), _.pad(mat.fine, 5), _.pad(mat.tier5, 5)));
		})
		return mats;	
	});
}
getGw2ProfitsRecipes().catch(function(err) {
	console.log(err);
});

// get data from CSV about statistics
/*{
	common: {
		tier1To4: [
			{
				amount: 10,
				times: 10,
				percentual: 5.18,
				hits: 100
			},
			...
		]
		tier5: ...
	},
	fine: ...
}*/
function getSilveressData() {
	var common = getSilveressCsv("data/Silveress's Public Tradepost Sheet - Common Analysis.csv",
		[1, 1, 161, 4, 1, 11, 161, 14]);
	var fine = getSilveressCsv("data/Silveress's Public Tradepost Sheet - Fine Analysis.csv",
		[2, 1, 35, 4, 2, 11, 9, 14]);
	return q.all([common, fine])
		.spread(function(commonResult, fineResult) {
			return {
				'common': commonResult,
				'fine': fineResult
			};
		});
}

function getSilveressCsv(location, c) {
	return q.nfcall(fs.readFile, location, {encoding: 'utf8'}).then(function(data) {
		return q.nfcall(csvParse, data, {})
	}).then(function(table) {
		var tier1To4 = getSubTable(table, c[0], c[1], c[2], c[3], ['amount', 'times', 'percentual', 'hits'], [parseInt, parseInt, parseFloat, parseInt]);
		var tier5 = getSubTable(table, c[4], c[5], c[6], c[7], ['amount', 'times', 'percentual', 'hits'], [parseInt, parseInt, parseFloat, parseInt]);
		return {
			'tier1To4': tier1To4,
			'tier5': tier5
		};
	});
}

function getSubTable(table, startRow, startColumn, endRow, endColumn, colNames, transformers) {
	var result = [];
	for(var i = startRow; i <= endRow; i++) {
		var entry = {}
		for(var j = startColumn; j <= endColumn; j++) {
			var jj = j - startColumn;
			var value = table[i][j];
			if(!!transformers[jj]) {
				value = transformers[jj](value);
			}
			entry[colNames[jj]] = value;
		}
		result.push(entry);
	}
	return result;
}