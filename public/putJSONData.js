const putJSONData = async (updatedData) => {
  const binId = '67a8ce85ad19ca34f8fcfee6'; 
  const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS'; 
  const url = "https://api.jsonbin.io/v3/b/" + binId;

  try {
	// Step 1: Update the JSONbin with the modified array
	const response = await fetch(url, {
	  method: 'PUT',
	  headers: {
		'X-Master-Key': apiKey,
		'Content-Type': 'application/json',
		'X-Bin-Versioning': 'false', // Prevent versioning if necessary
	  },
	  body: JSON.stringify(updatedData), // Convert back to a JSON string
	});

	if (response.status !== 200) {
	  throw new Error('Failed to update data');
	}

	alert('Data successfully updated');
	return await response.json();
  } catch (error) {
	console.error('Error:', error.message);
	throw error;
  }
};
