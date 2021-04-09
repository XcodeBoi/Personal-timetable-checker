// libray initialisation 

const socket = io();


// auto css control 

// on load
try {
	let tempNode = document.querySelector("#renderedDta").children
	tempNode[tempNode.length - 1].style.borderBottomStyle = "none"
	tempNode[tempNode.length - 2].style.borderBottomStyle = "none"
} catch(e) {console.log("No data to restyle."); /* console.log(e); */ }

// on update
const observer = new MutationObserver(() => {
	console.log("run")
	if(document.querySelector("#renderedDta").children.length == 0) {
		document.querySelector("#date").style.textAlign = "center"
	} else { document.querySelector("#date").style.textAlign = "right" }
}) // bro... negative list indexs dont work? 
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
	console.log(data)

	// handling of date related data
	currentDate = data.newDate
	document.getElementById("dateDisplay").innerHTML = new Date(currentDate).toISOString().split("T")[0]
	
	// handling of rendering new data
	// removing current data
	try {
		let tempNode = document.querySelector("#renderedDta").children
		for(i in tempNode) {
			tempNode[tempNode.length - 1].remove();
		}
		tempNode[tempNode.length - 1].remove(); // two more cycles are needed. 
		tempNode[tempNode.length - 1].remove();
	} catch(e) { console.log("No data to remove."); /* console.log(e); */ }
	// rendering new data
	for(i in data.newData) {
		console.log("execute")
		let itemTime = document.createElement("div")
		itemTime.classList.add("itemTime")
		itemTime.appendChild(document.createTextNode(data.newData[i].time))
		let item = document.createElement("div")
		item.classList.add("item")
		item.appendChild(document.createTextNode(data.newData[i].name))
		document.querySelector("#renderedDta").appendChild(itemTime)
		document.querySelector("#renderedDta").appendChild(item)
	}
	// style clean up
	try {
		let tempNode = document.querySelector("#renderedDta").children
		tempNode[tempNode.length - 1].style.borderBottomStyle = "none"
		tempNode[tempNode.length - 2].style.borderBottomStyle = "none"
	} catch(e) {console.log("No data to restyle."); /* console.log(e); */ }
	
	// signify completion of data update
	document.getElementById("msg").style.opacity = "0%"
})
