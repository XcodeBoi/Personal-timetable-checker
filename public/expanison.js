
const socket = io();

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


socket.on("updatedData", data => {
	console.log(data)

	// handling of date related data
	currentDate = data.newDate
	document.getElementById("dateDisplay").innerHTML = new Date(currentDate).toISOString().split("T")[0]
	
	// handling of rendering new data
	
	
	// signify completion of data update
	document.getElementById("msg").style.opacity = "0%"
})
