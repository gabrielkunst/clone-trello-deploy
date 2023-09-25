const colorPalleteWrapper = document.querySelector(".colorPaletteWrapper");
const documentBody = document.body;

function toggleColorPalette() {
	console.log("should toggle color palette");
	colorPalleteWrapper.classList.toggle("hidden");
}

function handleColorPaletteClick(element) {
	console.log(element);
	const color = element.innerHTML;
	changeBackground(color);
}

function changeBackground(color) {
	documentBody.style.backgroundColor = color;
	saveBackgroundToStorage(color);
}

function saveBackgroundToStorage(color) {
	localStorage.setItem("backgroundColor", color);
}

function getBackgroundFromStorage() {
	const color = localStorage.getItem("backgroundColor");
	return color;
}

function handlePageLoad() {
	const storageColor = getBackgroundFromStorage();
	if (storageColor) {
		changeBackground(storageColor);
	}
}

window.addEventListener("DOMContentLoaded", handlePageLoad);
