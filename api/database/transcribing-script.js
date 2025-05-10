const fs = require('fs');
const rawText = fs.readFileSync( __dirname + "/transc.txt", "utf-8")
const rawArray = (rawText.split("\n"))
const arr = rawArray.map(x => {
	const rawObj = {};

	const prefix = x.slice(0, 3).join('');
	if (["sho", "hid", "pla"].includes(prefix)) return;

	const charMap = {
		mc: "you",
		m: "Monika",
		s: "Sayori",
		n: "Natsuki",
		y: "Yuri"
	};

	const charKey = x[0];

	if (charMap[charKey]) {
		rawObj.char = charMap[charKey];
		const parts = x.slice(0, -1).join('').split('"');
		let content = parts[1] || '';

		content = content.replace("[Player]", "#var");
		rawObj.content = content;

		return rawObj;
	}

	if (charKey === `"`) {
		rawObj.content = x;
		return rawObj;
	}
});

const bestArr = arr.filter(x => x != null)

try{
	fs.writeFileSync("./algo.json", JSON.stringify(bestArr))
} catch(e) {
	console.log(e)
}
