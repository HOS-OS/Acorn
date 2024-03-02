document.addEventListener('DOMContentLoaded', function () {
  // Check if local storage has the 'savedURLs' item
  if (localStorage.getItem('savedURLs')) {
    // Retrieve and parse the JSON data
    var savedURLs = JSON.parse(localStorage.getItem('savedURLs'));

    // Get the history-container element
    var historyContainer = document.getElementById('history-container');

    // Create an unordered list element
    var ul = document.createElement('ul');

    // Iterate through each URL and create list items with links
    savedURLs.forEach(function (urlWithTimestamp) {
      var li = document.createElement('li');

      // Split the timestamp and URL
      var parts = urlWithTimestamp.split(', ');
      var timestamp = parts[0];
      var url = parts[1];

      var link = document.createElement('a');

      link.textContent = timestamp; // Use timestamp as link text
      link.href = url; // Set the link's href attribute to the URL
      link.target = '_blank'; // Open the link in a new tab

      // Add a click event listener to the link
      link.addEventListener('click', function (event) {
        event.preventDefault();
        loadURL(url); // Call a function to load the URL
      });

      // Append the link to the list item
      li.appendChild(link);
      ul.appendChild(li);
    });

    // Append the list to the history-container
    historyContainer.appendChild(ul);
  }
});

function toggleHistory() {
  // Function to toggle the history section visibility
  var historySection = document.getElementById('history');
  historySection.style.display = (historySection.style.display === 'none') ? 'block' : 'block';
}

function loadURL(url) {
  // Function to load the specified URL
  // You can use window.location or other methods to navigate to the URL
  window.location.href = url;
}



document.addEventListener('DOMContentLoaded', function () {
  // Get the elements
  var clearSettings = document.getElementById('clear-settings');
  var clearButton = document.getElementById('clearhistory');

  // Add click event listener to the clear button
  clearButton.addEventListener('click', function () {
    // Ask for confirmation
    var userConfirmation = confirm('Are you sure you want to clear your history? This can\'t be undone!');

    if (userConfirmation) {
      // Get the selected value from the dropdown
      var selectedOption = clearSettings.value;

      // Determine the time period based on the selected option
      var currentDate = new Date();
      var clearTime;

      switch (selectedOption) {
        case 'hour':
          clearTime = currentDate.setHours(currentDate.getHours() - 1);
          break;
        case 'day':
          clearTime = currentDate.setDate(currentDate.getDate() - 1);
          break;
        case 'week':
          clearTime = currentDate.setDate(currentDate.getDate() - 7);
          break;
        case 'month':
          clearTime = currentDate.setMonth(currentDate.getMonth() - 1);
          break;
        case 'all':
          clearTime = 0;
          break;
        default: // Default to 1 day
          clearTime = currentDate.setDate(currentDate.getDate() - 1);
          break;
      }

      // Clear local storage based on the determined time
      var clearedItemsCount = clearLocalStorage(clearTime);

      // Optionally, you can reload the page or perform any other actions after clearing
      // window.location.reload(); // Uncomment this line if you want to reload the page

      // Show an alert to the user with election-related information
      alert('You Removed #' + clearedItemsCount + ' links from history.');
    }
  });

  // Function to clear local storage based on time
  function clearLocalStorage(time) {
    var savedURLs = JSON.parse(localStorage.getItem('savedURLs')) || [];

    // Filter out items based on the time condition
    var updatedSavedURLs = savedURLs.filter(function (item) {
      return item.timestamp > time;
    });

    // Save the updated items back to local storage
    localStorage.setItem('savedURLs', JSON.stringify(updatedSavedURLs));

    // Log a message or perform any other actions after clearing
    

    // Return the count of cleared items
    return savedURLs.length - updatedSavedURLs.length;
  }
});
