'use strict' 
 
 // Get a list of items in inventory based on the classification_id 
 const classificationList = document.getElementById("classification_id")
 if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classificationId = classificationList.value
   
    fetch(`/inv/getInventory/${classificationId}`)
      .then(response => response.json())
      .then(data => buildInventoryList(data))
      .catch(error => console.error("Fetch error:", error))
  })
 }

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
  let inventoryDisplay = document.getElementById("inventoryDisplay"); 
  // Set up the table labels 
  let dataTable = '<thead>'; 
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
  dataTable += '</thead>'; 
  // Set up the table body 
  dataTable += '<tbody>'; 
  // Iterate over all vehicles in the array and put each in a row 
  data.forEach(function (element) { 
    dataTable += `<tr class="inventory-row">`;
    dataTable += `<td><span class="vehicle-name">${element.inv_make} ${element.inv_model}</span></td>`; 
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
  }) 
  dataTable += '</tbody>'; 
  // Display the contents in the Inventory Management view 
  inventoryDisplay.innerHTML = dataTable; 
}



