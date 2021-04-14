
fetch = require("node-fetch"); // using node fetch because chrome dev tools can generate formatting for it
const express = require("express");
const app = express();
const path = require("path");
const socketio = require("socket.io");
const fs = require("fs")
const https = require("https");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

httpsOptions = {
	cert: fs.readFileSync("./ssl/back_textedit_dev.crt"),
	ca: fs.readFileSync("./ssl/back_textedit_dev.ca-bundle"),
	key: fs.readFileSync("./ssl/back_textedit_dev.key")
}

app.use((req, res, next) => {
	if(req.protocol === "http") {
		res.redirect(301, `https://${req.headers.host}${req.url}`)
	}
	next()
})

async function dataFetch(date, clientID) {
	// fetch data from api
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
	}).then(res => res.json()) // parsing data
	// instance based variable declaration
	let classesUnordered = []
	let periodCache = ""
	let teacherCache = undefined

	// data processing functions
	function timeUTC(utc) {
		try { // catch if the event has no associated time
			let raegraeg = new Date(utc).toLocaleTimeString("en-US", { timeZone: "Australia/Melbourne" })
			// custom processing of data to present in readable format
			return `${raegraeg.split(":")[0]}:${raegraeg.split(":")[1]} ${raegraeg.split(":")[2].split(" ")[1]}`
		}
		catch(e) {
			return "all day"
		}
	}
	function teacherGet(periodCache, list) {
		// ignore if its not regular class
		if(periodCache > 99) { return null } else {
			let tempList = []
			// extract data associated with teacher
			for(i in list) {
				if(i > 5){tempList.push(list[i])}
			}
			if(tempList.length == 0){ teacherCache = undefined; return null; } // no teacher
			if(tempList.length == 1){ teacherCache = undefined; return tempList[0]; } // regular teacher
			if(tempList.length == 2){ teacherCache = tempList[0].split(">")[1].split("<")[0]; return tempList[1]; } // CRT
		}
	}
	function periodCheck(periodData, i) {
		// check if regular period
		if(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(periodData) != true) {
			// indication of non regular periods is done through periods over 100. This is bad but easy.
			periodCache = (parseInt(i) + 100).toString(); return periodCache;
		} else { return periodData }
	}
	function locationChk(periodData, locationData) {
		// remove location data for abnormal events
		if(parseInt(periodData) > 99) { return null } else { return locationData }
	}

	// modifying data
	function dataSort(res) {
		for(i in res.d) {
			classesUnordered.push({
				// 4 - 10MATM1 - AU.04B - <strike>BKA</strike>&nbsp; 02CRT
				"name": res.d[i].title,
				"time": timeUTC(res.d[i].start),
				"period": periodCheck(res.d[i].longTitleWithoutTime.split(" ")[0], i),
				"location": locationChk(periodCache, res.d[i].longTitleWithoutTime.split(" ")[4]),
				"teacher": teacherGet(periodCache, res.d[i].longTitleWithoutTime.split(" ")),
				"CRT": teacherCache
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
				}catch(e){}
			}
		}
		return classesUnordered
	}

	// return data to front end processing
	return dataSort(fetch_data) 
}

app.get("/", async (req, res) => { // async is written in because I need await to set the varible
	let dateSplit = new Date().toLocaleDateString({ timeZone: "Australia/Melbourne"}).split("/")
	let date = "2021-04-01" // new Date(parseInt(dateSplit[2]), parseInt(dateSplit[0]) - 1, parseInt(dateSplit[1]) + 1, 0, 0, 0).toISOString().split("T")[0]
	console.log("------------------------")
	sortedData = await dataFetch(date, "")
	res.render("newIndex.ejs", { sortedData: sortedData, date: date})
})

const httpsServer = https.createServer(httpsOptions, app)
httpsServer.listen(50500, "0.0.0.0", () => console.log("listening 50500"))

const io = socketio(httpsServer)

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
    	} 
    	else if(data.dateChange == "today") {
    		let initDate = new Date(data.date)
    		socket.emit("updatedData", { newData: await dataFetch(initDate.toISOString().split("T")[0], ""), newDate: initDate })
    	}else { console.log(data) }
        })
})