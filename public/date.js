const socket = io();

document.getElementById("left").addEventListener("click", () => {
	console.log("left");
	socket.emit("dateChange", { dateChange: "decrease" })
});
document.getElementById("right").addEventListener("click", () => {
	console.log("right");
	socket.emit("dateChange", { dateChange: "increase" })
});

socket.on("updatedData", data => console.log(data))
socket.on("initData", data => console.log(data))
