function getData() {
  return JSON.parse(localStorage.getItem("promotores")) || [];
}

function saveData(data) {
  localStorage.setItem("promotores", JSON.stringify(data));
}