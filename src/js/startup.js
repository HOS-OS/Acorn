// Fetch package.json to get the current version
fetch('../package.json')
  .then(res => res.json())
  .then(res => {
    const version = res.version;
    createTab();
    const updateAvailableElement = document.getElementById('update-available');
    
    // Fetch latest release from GitHub
    fetch('https://api.github.com/repos/HOS-OS/Acorn/releases/latest')
      .then(res => res.json())
      .then(res => {
        // Check if the latest release version is different from the current version
        if (res.tag_name !== 'V' + version) {
          const updateAvailableVersionElement = document.getElementById('update-available-version');
          updateAvailableVersionElement.innerText = res.tag_name.slice(1);

          // Show the update available alert
          updateAvailableElement.style.display = 'block';
          updateAvailableElement.setAttribute('data-download-url', res.assets[0].browser_download_url); // Storing download URL in a data attribute
        }
      });
  });

// Function to handle click event on update available alert
function handleUpdateAvailableClick(event) {
  // Prevent the default behavior of the link
  event.preventDefault();

  const downloadUrl = event.currentTarget.getAttribute('data-download-url'); // Retrieve download URL from data attribute
  
  fetch('https://api.github.com/repos/HOS-OS/Acorn/releases/latest')
      .then(res => res.json())
      .then(res => {
          const updateDetails = res.body; // Assuming GitHub API provides update details in the body field
          const updateDetailsElement = document.getElementById('update-details');

          // Creating a dropdown for selecting Mac/PC type
          const dropdownHTML = `
              <select id="mac-type">
                  <option value="intel">Intel</option>
                  <option value="m1">M1</option>
                  <option value="x64">PC (x64)</option> <!-- New x64 option -->
              </select>
          `;

          updateDetailsElement.innerHTML = `
              <p>${updateDetails}</p>
              <p></p>
              <center><p>Select version:</p></center> 
              <p></p>

              <center><p>Get ${dropdownHTML} Version</p></center>
              <p></p>

              <button id="download-btn" class="flex-1 w-full px-4 py-2 font-bold text-white transition bg-cyan-500 rounded-md hover:bg-cyan-600">Download</button>
          `;

          // Adding click event listener to the download button
          document.getElementById('download-btn').addEventListener('click', () => {
              const selectedType = document.getElementById('mac-type').value;
              let downloadUrl;

              // Determine the download URL based on the selected type
              if (selectedType === 'intel') {
                  downloadUrl = getDownloadUrlForMacType(res.assets, 'Intel');
              } else if (selectedType === 'm1') {
                  downloadUrl = getDownloadUrlForMacType(res.assets, 'M1');
              } else if (selectedType === 'x64') {  // Handle x64 option
                  downloadUrl = getDownloadUrlForMacType(res.assets, 'X64');
              }

              // Download the file
              if (downloadUrl) {
                  window.location.href = downloadUrl;
                  window.onunload = function() {
                      alert("File has been saved successfully!");
                  };
              } else {
                  console.error('Download URL not found for the selected type.');
              }
          });

          // Show the update available message
          const updateAvailableUpdated = document.getElementById('update-available-updated');
          updateAvailableUpdated.classList.remove('hidden');
      })
      .catch(error => {
          console.error('Error fetching update details:', error);
      });
}

// Function to get the download URL based on the type
function getDownloadUrlForMacType(assets, type) {
    return assets.find(asset => asset.name.includes(`Acorn.Browser.${type}`))?.browser_download_url;
}

// Add click event listener to the update available alert box
document.addEventListener('DOMContentLoaded', function() {
  const updateAvailableAlert = document.getElementById('update-available');
  if (updateAvailableAlert) {
    updateAvailableAlert.addEventListener('click', handleUpdateAvailableClick);
  }
});

// Initialize sortable tabs
const sortable = Sortable.create(byId('tabbar'), {
  animation: 150
});

// Hide loading indicator after some time
setTimeout(() => {
  byId('loading').classList.add('opacity-0');
  setTimeout(() => {
    byId('loading').style.display = 'none';
  }, 500);
}, 1000);

// Show offline message if user is offline
if (!window.navigator.onLine) {
  byId('offline').style.display = 'block';
}
