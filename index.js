
// todo
// convert server utc to aest
// client side data rendering
// restyling
// fix global scope varible
// month view?
// email selina if she has an idea about removing line

fetch = require("node-fetch"); // using node fetch because chrome dev tools can generate formatting for it
const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");

let periodCache = ""
// I didnt know how to fix this so i put it in the global scope.
// multiple people updating at the same time will cause huggeee issues

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

function time(data) { // this may be my first time not using arrow functions
	try {
		let raegraeg = data.longTitle.split(":") // I slammed my keyboard with my hand to get that varible name
		return `${raegraeg[0]}:${raegraeg[1]}`
	}
	catch {
		return "all day"
	}
}

function timeUTC(utc) {
	try {
		let raegraeg = new Date(utc).toLocaleTimeString()
		return `${raegraeg.split(":")[0]}:${raegraeg.split(":")[1]} ${raegraeg.split(":")[2].split(" ")[1]}`
	}
	catch {
		return "all day"
	}
}

function teacherGet(periodCache, list) {
	if(periodCache > 99) { return null } else {
		let newList = []
		let completeString = ""
		let tempList = []
		// let tempList = list.map((value, index) => {console.log(value + index); if(index > 5){return value}})
		for(i in list) {
			if(i > 5){tempList.push(list[i])}
		}
		try {
			if(tempList.length > 1){newList[0] = tempList[0].split(">")[1].split("<")[0]; newList[1] = tempList[1]}
			else { newList[0] =  tempList[0] }
		}
		catch {
			newList[0] = " "
		}
		for(i in newList){
			completeString = completeString + newList[i]
		}
		return completeString
	}
}

function periodCheck(periodData, i) {
	if(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(periodData) != true) {periodCache = (parseInt(i) + 100).toString(); return periodCache} else { periodCache = periodData; return periodCache }
}

function locationChk(periodData, locationData) {
	if(parseInt(periodData) > 99) { return null } else { return locationData }
}

// async is written in because I need await to set the varible
async function dataFetch(date, clientID) { 
	let classesUnordered = []
	let fetch_data = await fetch(process.env.fetchAddress, {
	  "headers": {
	    "accept": "*/*",
	    "accept-language": "en-GB,en;q=0.9",
	    "content-type": "application/json",
	    "sec-fetch-dest": "empty",
	    "sec-fetch-mode": "cors",
	    "sec-fetch-site": "same-origin",
	    "x-requested-with": "XMLHttpRequest",
	    "cookie": process.env.fetch_cookie
	  },
	  "referrer": process.env.fetch_referrer,
	  "referrerPolicy": "strict-origin-when-cross-origin",
	  "body": `{\"userId\":2959,\"startDate\":\"${date}\",\"endDate\":\"${date}\",\"page\":1,\"start\":0,\"limit\":150}`,
	  "method": "POST",
	  "mode": "cors"
	}).then(res => res.json())
	function dataMutated(res) {
		for(i in res.d) {
			classesUnordered.push({
				// 4 - 10MATM1 - AU.04B - <strike>BKA</strike>&nbsp; 02CRT
				"name": res.d[i].title,
				"time": timeUTC(res.d[i].start),
				"period": periodCheck(res.d[i].longTitleWithoutTime.split(" ")[0], i),
				"location": locationChk(periodCache, res.d[i].longTitleWithoutTime.split(" ")[4]),
				"teacher": teacherGet(periodCache, res.d[i].longTitleWithoutTime.split(" "))
			})
		}
		let cyclePass = [false]
		while(cyclePass.includes(false) == true) {
			cyclePass = []
			for(i in classesUnordered) {
				try {
					if(parseInt(classesUnordered[i].period) > parseInt(classesUnordered[parseInt(i) + 1].period)) {
						[classesUnordered[i], classesUnordered[parseInt(i) + 1]] = [classesUnordered[parseInt(i) + 1], classesUnordered[i]];
						cyclePass.push(false)
					}
					else {
						cyclePass.push(true)
					}
				}catch{}
			}
		}
		return classesUnordered
	}
	let result = dataMutated(fetch_data)
	 // if you exectute the function more than once in this scope the dataset doubles
	 // a funky quirk of my poor programming and bad practices.
	 // also gave me a hard time trying to debug.
	return result 
}

app.get("/", async (req, res) => { // async is written in because I need await to set the varible
	let date = new Date().toISOString().split("T")[0] // it is unfathomable how long it took me to find .toISOString()
	console.log("------------------------")
	sortedData = await dataFetch(date, "")
	res.render("newIndex.ejs", { sortedData: sortedData, date: date})
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("server started on port 3000");
});

const io = socketio(server)

io.on("connection", socket => {
    console.log("connection")

    socket.on("dateChange", async data => {
    	if(data.dateChange == "increase") {
    		let initDate = new Date(data.date)
    		initDate.setDate(initDate.getDate() + 1)
    		socket.emit("updatedData", { newData: await dataFetch(initDate.toISOString().split("T")[0], ""), newDate: initDate })
    	} 
    	else if(data.dateChange == "decrease") {
    		let initDate = new Date(data.date)
    		initDate.setDate(initDate.getDate() - 1)
    		socket.emit("updatedData", { newData: await dataFetch(initDate.toISOString().split("T")[0], ""), newDate: initDate })
    	} else { console.log(data) }
        })
})