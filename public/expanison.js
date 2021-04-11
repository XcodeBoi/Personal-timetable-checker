// libray initialisation 

const socket = io();

// auto css control 

// on load
try {
	let tempNode = document.querySelector("#renderedDta").children
	tempNode[tempNode.length - 1].style.borderBottomStyle = "none"
	tempNode[tempNode.length - 2].style.borderBottomStyle = "none"
} catch(e) {console.log("No data to restyle."); /* console.log(e); */ }
if(document.querySelector("#renderedDta").children.length == 0) {
	document.querySelector("#date").style.textAlign = "center"
} else { document.querySelector("#date").style.textAlign = "right" }

// on update
const observer = new MutationObserver(() => {
	if(document.querySelector("#renderedDta").children.length == 0) {
		document.querySelector("#date").style.textAlign = "center"
	} else { document.querySelector("#date").style.textAlign = "right" }
}) 
observer.observe(document.querySelector("#renderedDta"), {childList: true, attributes: true, subtree: true})


// date incrementor button control

document.getElementById("left").addEventListener("click", () => {
	socket.emit("dateChange", { dateChange: "decrease", date: new Date(currentDate) })
	document.getElementById("msg").style.opacity = "100%"
});
document.getElementById("right").addEventListener("click", () => {
	socket.emit("dateChange", { dateChange: "increase", date: new Date(currentDate) })
	document.getElementById("msg").style.opacity = "100%"
});
document.getElementById("leftBot").addEventListener("click", () => {
	socket.emit("dateChange", { dateChange: "decrease", date: new Date(currentDate) })
	document.getElementById("msg").style.opacity = "100%"
});
document.getElementById("rightBot").addEventListener("click", () => {
	socket.emit("dateChange", { dateChange: "increase", date: new Date(currentDate) })
	document.getElementById("msg").style.opacity = "100%"
});
document.getElementById("dateDisplay").addEventListener("click", () => {
	socket.emit("dateChange", { dateChange: "increase", date: new Date() })
	document.getElementById("msg").style.opacity = "100%"
});


// incoming data control

socket.on("updatedData", data => {
	// handling of date related data
	currentDate = data.newDate
	document.getElementById("dateDisplay").innerHTML = new Date(currentDate).toISOString().split("T")[0]
	
	// handling of rendering new data
	// removing current data
	document.querySelector("#renderedDta").querySelectorAll('*').forEach(value => value.remove())
	// rendering new data (i hate this code)
	for(i in data.newData) {
		let normalTeacher = ""
		let itemTime = document.createElement("div")
		let item = document.createElement("div")
		let teacherSpan = document.createElement("span")

		itemTime.classList.add("itemTime")
		itemTime.appendChild(document.createTextNode(data.newData[i].time))

		classDataTitle = data.newData[i].name

		if(data.newData[i].location != null) { classDataTitle = classDataTitle + " - " + data.newData[i].location}
		
		if(data.newData[i].teacher != null) {
			teacherSpan.appendChild(document.createTextNode(" - "))
			if(data.newData[i].CRT != undefined) {
				let crossSpan = document.createElement("s")
				crossSpan.appendChild(document.createTextNode(data.newData[i].CRT))
				teacherSpan.appendChild(crossSpan)
				teacherSpan.appendChild(document.createTextNode(" " + data.newData[i].teacher))
			} else { teacherSpan.appendChild(document.createTextNode(data.newData[i].teacher)) }
		}

		item.classList.add("item")
		item.appendChild(document.createTextNode(classDataTitle))
		item.appendChild(teacherSpan)

		document.querySelector("#renderedDta").appendChild(itemTime)
		document.querySelector("#renderedDta").appendChild(item)
	}
	// style clean up
	try {
		let tempNode = document.querySelector("#renderedDta").children
		tempNode[tempNode.length - 1].style.borderBottomStyle = "none"
		tempNode[tempNode.length - 2].style.borderBottomStyle = "none"
	} catch(e) { /* console.log("No data to restyle."); console.log(e); */ }
	
	// signify completion of data update
	document.getElementById("msg").style.opacity = "0%"
})
