const xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.jsonbin.io/v3/b/<BIN_ID>");
xhr.setRequestHeader("X-Master-Key", "$2b$10$lormcImUcFticJYa5p5dduaXDAP/IrVIR.TtwZu9y6olRibo3MYmu");
xhr.onload = function() {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    // Update the data here
    const updatedData = {
      ...data,
      "name": "John Doe",
      "age": 30,
    };
    xhr.open("PUT", "https://api.jsonbin.io/v3/b/<BIN_ID>");
    xhr.setRequestHeader("X-Master-Key", "$2b$10$lormcImUcFticJYa5p5dduaXDAP/IrVIR.TtwZu9y6olRibo3MYmu");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(updatedData));
  } else {
    console.log("Error reading JSON file: " + xhr.status);
  }
};
xhr.send();
