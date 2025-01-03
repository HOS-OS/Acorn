/**
 * Set the title of a tab
 * @param {HTMLElement} tab
 * @param {string} title
 */
function setTitle(tab, title) {
  tab.children[1].innerText = title;
}


/**
 * Set the omnibox's value
 * @param {string} text
 */
function setOmnibox(text) {
  if (document.activeElement === omnibox) return;
  let home = localStorage.getItem('homepage');
  if (!home) {
    home = defaultHome;
  }
  if (text.startsWith(home)) {
    omnibox.value = '';
  } else {
    omnibox.value = text;
  }
}


/**
 * Switch the active tab
 * @param {string} tab - The hash of the tab to switch to
 */
function switchTabs(tab) {
  let currentTab = document.querySelector('.active-tab');
  if (currentTab) {
    currentTab.classList.remove('active-tab');
    currentTab.classList.add('tab');
  }

  let activeTab = byId('tab-' + tab);
  activeTab.classList.add('active-tab');
  activeTab.classList.remove('tab');

  let views = document.querySelectorAll('.view');
  views.forEach(x => {
    x.style.display = 'none';
  });

  byId('view-' + tab).style.display = 'flex';

  view = byId('view-' + tab);
  activeHash = tab;

  setOmnibox(view.src);
  // Hacky, but it works (until I find a better way)
  try {
    // First, execute the functions assuming the DOM is ready
    setOmnibox(view.getURL());
    checkSSL(view.getURL());
    grayOut();
    fillHeart(view.getURL());
  } catch (e) {
    // If the DOM isn't ready, wait for it
    // console.log(e);
    view.addEventListener('dom-ready', () => {
      setOmnibox(view.getURL());
      checkSSL(view.getURL());
      grayOut();
      fillHeart(view.getURL());
    });
  }
}


/**
 * Create a tab and append it to the tabbar
 * @param {string} [url] - If present, the new tab's URL will be set to this, otherwise it will be set to the default homepage
 */
function createTab(url) {
  let tab = document.createElement('button');
  let span = document.createElement('span');
  let icon = document.createElement('img');
  let hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  tab.classList.add('tab');
  tab.id = 'tab-' + hash;
  tab.onmousedown = (e) => {
    switchTabs(hash);
    checkForDelTab(e, hash);
  };
  span.innerText = 'New Tab';
  icon.src = './icons/favicon.png';
  icon.width = '16';
  icon.height = '16';
  tab.appendChild(icon);
  tab.appendChild(span);

  byId('tabbar').appendChild(tab);

  let view = document.createElement('webview');
  view.id = 'view-' + hash;
  view.classList.add('view');
  view.allowpopups = 'allowpopups';
  view.webpreferences = 'nativeWindowOpen=true';
  const uaValue = localStorage.getItem('ua');
  if (uaValue) {
    view.useragent = uaValue;
  } else {
    view.useragent = 'Acorn Browser/1.3.2';
  }

  if (url) {
    view.src = url;
  } else {
    const homepageValue = localStorage.getItem('homepage');
    if (homepageValue) {
      view.src = homepageValue;
    } else {
      const searchurlValue = localStorage.getItem('searchurl');
      if (searchurlValue) {
        view.src = defaultHome + '?v=false&e=' + searchurlValue;
      } else {
        view.src = defaultHome + '?v=false';
      }
    }
  }

  byId('views').appendChild(view);
  addListenersToView(view, hash);
  switchTabs(hash);
  omnibox.focus();
}


/** Toggle the visibility of the 'more' menu */
function toggleMoreMenu() {
  const menu = byId('more-menu');
  if (menu.style.display === 'block') {
    menu.style.display = 'none';
    cover.style.display = 'none';
  } else {
    menu.style.display = 'block';
    cover.style.display = 'block';
  }
}


/** Open the settings menu */
function openSettings() {
  const searchurlElement = byId('settings-searchurl');
  const homepageElement = byId('settings-homepage');
  const uaElement = byId('settings-ua');
  const openInNewTabElement = byId('settings-open-in-new-tab');
  const searchUrlValue = localStorage.getItem('searchurl');
  const homePageValue = localStorage.getItem('homepage');
  const uaValue = localStorage.getItem('ua');
  const openInNewTab = localStorage.getItem('openInNewTab');

  searchurlElement.value = searchUrlValue;
  homepageElement.value = homePageValue;
  uaElement.value = uaValue;
  uaElement.placeholder = 'Acorn Browser/1.3.2';
  openInNewTabElement.checked = openInNewTab === 'true';

  settings.style.display = 'block';
}


/** Hide the settings menu */
function hideSettings() {
  settings.style.display = 'none';
}


/** Save any changed settings to localStorage */
function saveSettings() {
  hideSettings();

  const searchurlElement = byId('settings-searchurl');
  const homepageElement = byId('settings-homepage');
  const uaElement = byId('settings-ua');
  const openInNewTabElement = byId('settings-open-in-new-tab');

  localStorage.setItem('searchurl', searchurlElement.value);
  localStorage.setItem('homepage', homepageElement.value);
  localStorage.setItem('ua', uaElement.value);
  localStorage.setItem('openInNewTab', openInNewTabElement.checked);
}

/** add bookmarks to list and also ask for name for link */
function openBookmarks() {
  let el = byId('bookmarks-container');
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
  let openInNewTab = localStorage.getItem('openInNewTab');
  if (bookmarks) {
    bookmarks.forEach((bookmark) => {
      let p = document.createElement('p');
      p.className = 'mb-2 overflow-hidden font-mono text-gray-700 whitespace-nowrap text-ellipsis';
      let img = document.createElement('img');
      img.src = bookmark.icon; // Assuming bookmark.icon is the icon URL
      img.className = 'inline w-4 h-4 mr-4';
      let a = document.createElement('a');
      a.setAttribute('data-link', bookmark.link); // Accessing link property
      a.innerText = `${bookmark.name} - ${bookmark.link}`; // Displaying name - link
      a.className = 'underline cursor-pointer';
      a.onclick = (e) => {
        if (openInNewTab === 'true') {
          createTab(e.target.dataset.link);
        } else {
          view.loadURL(e.target.dataset.link);
        }
        byId('bookmarks').style.display = 'none';
      }
      p.appendChild(img);
      p.appendChild(a);
      el.appendChild(p);
    });
  }
  byId('bookmarks').style.display = 'block';
}

/** heart and unheart bookmarks */
function fillHeart(url) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
  let isInBookmarks = bookmarks.some((bookmark) => bookmark.link === url);
  let el = byId('bookmark');

  el.children[0].src = isInBookmarks ? './icons/heart_filled.png' : './icons/heart_empty.png';
}



/** Hide the right-click menu */
function hideMenu() {
  menu.style.display = 'none';
  cover.style.display = 'none';
}


/** Close the active tab and switch to a new one */
function closeTab() {
  let tabbar = byId('tabbar');
  if (tabbar.children.length === 1) return;
  byId('view-' + activeHash).remove();
  byId('tab-' + activeHash).remove();
  switchTabs(tabbar.lastChild.id.slice(4));
}


/**
 * Check if a tab is ctrl-clicked upon, and, if so, delete it
 * @param {MouseEvent} e
 * @param {string} hash - The hash of the tab
 */
function checkForDelTab(e, hash) {
  if (e.ctrlKey || e.metaKey || e.button === 1) {
    closeTab(hash)
  }
}






async function checkSSL(url) {
  try {
    const response = await fetch(url);
    const sslInfo = response.headers.get('strict-transport-security');
    
    // Show the SSL information modal
    const sslInformationModal = document.getElementById('sslInformation');
    const sslContainer = document.getElementById('sslContainer');
    const ssl = document.getElementById('ssl');

    if (sslInfo) {
      // Parse max-age from SSL information
      const maxAgeMatch = sslInfo.match(/max-age=(\d+)/);
      const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0;
      const maxAgeDays = Math.ceil(maxAgeSeconds / (60 * 60 * 24)); // Convert seconds to days and round up

      // Parse other SSL attributes from SSL information
      const includeSubdomains = /includeSubDomains/i.test(sslInfo);
      const preload = /preload/i.test(sslInfo);
      const redirect = /redirect/i.test(sslInfo);

      // Check if SSL certificate has expired
      const expirationDate = new Date(maxAgeSeconds * 1000 + Date.now());
      const currentDate = new Date();

      if (expirationDate < currentDate) {
        // SSL certificate has expired
        const errorMessage = `SSL certificate for ${url} has expired on ${expirationDate.toISOString()}`;
        console.error(errorMessage);

        // Update SSL indicator accordingly
        sslContainer.innerHTML = `<span class="text-red-500">${errorMessage}</span>`;
        ssl.setAttribute('src', './icons/lock-open.png');

        // Log the error or handle it as needed
        // For example, you can send this information to a server or log it in the console.
      } else {
        // SSL is valid
        sslContainer.innerHTML = `
          <span class="text-green-500">SSL is valid for ${url}</span><br>
          <span>Include Subdomains: ${includeSubdomains}</span><br>
          <span>Preload: ${preload}</span><br>
          <span>Redirect from HTTP to HTTPS: ${redirect}</span><br>
          <span>Max Age: ${maxAgeDays} days</span>
        `;
        ssl.setAttribute('src', './icons/lock-closed.png');
        return true;
      }
    } else {
      // No SSL Information found
      sslContainer.innerHTML = `<span class="text-red-500">No SSL Information found for ${url}</span>`;
      ssl.setAttribute('src', './icons/lock-open.png');
      return false;
    }
  } catch (error) {
    // Handle the error and update SSL indicator accordingly
    const errorMessage = `Error fetching URL: ${error.message}`;
    console.error(errorMessage);

    const sslContainer = document.getElementById('sslContainer');
    const ssl = document.getElementById('ssl');

    sslContainer.innerHTML = `<span class="text-red-500">${errorMessage}</span>`;
    ssl.setAttribute('src', './icons/error.png');

    // Hide the SSL information modal in case of an error
    const sslInformationModal = document.getElementById('sslInformation');
    sslInformationModal.classList.add('hidden');
    
    // Log the error or handle it as needed
    // For example, you can send this information to a server or log it in the console.

    return false;
  }
}











/** Gray out the back/forward buttons if the user can't go back/forward */
function grayOut() {
  let backImage = back.getElementsByTagName('img')[0];
  let forwardImage = forward.getElementsByTagName('img')[0];

  if (view.canGoBack()) {
    backImage.style.opacity = 0.5;
    back.classList.add('hoverable');
  } else {
    backImage.style.opacity = 0.2;
    back.classList.remove('hoverable');
  }
  if (view.canGoForward()) {
    forwardImage.style.opacity = 0.5;
    forward.classList.add('hoverable');
  } else {
    forwardImage.style.opacity = 0.2;
    forward.classList.remove('hoverable');
  }
}


 // Function to set dark mode
 function setDarkMode(isDarkMode) {
  const root = document.documentElement;
  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Function to handle dark mode toggle
function handleDarkModeToggle() {
  const darkModeToggle = document.getElementById('dark-mode');

  // Check if dark mode is enabled in local storage
  const isDarkModeEnabled = localStorage.getItem('darkMode') === 'true';

  // Set initial state
  setDarkMode(isDarkModeEnabled);
  darkModeToggle.checked = isDarkModeEnabled;

  // Add event listener for toggle change
  darkModeToggle.addEventListener('change', () => {
    const isChecked = darkModeToggle.checked;
    setDarkMode(isChecked);

    // Save state in local storage
    localStorage.setItem('darkMode', isChecked);
  });
}

// Call the function when the DOM is ready
document.addEventListener('DOMContentLoaded', handleDarkModeToggle);


// Function to check internet connectivity
function isOnline() {
  return navigator.onLine;
}

// Add event listener to show Snake game popup on button click
document.getElementById('snake-game-btn').addEventListener('click', function() {
  // Hide other popups if needed
  document.getElementById('offline').style.display = 'none';

  // Show Snake game popup
  document.getElementById('snake-game-popup').style.display = 'block';
});

// Add event listener to close Snake game popup
document.getElementById('snake-game-close').addEventListener('click', function() {
  // Hide Snake game popup
  document.getElementById('snake-game-popup').style.display = 'none';

  // Show No Internet popup
  document.getElementById('offline').style.display = 'block';
});





// Function to toggle the history section
function toggleHistory() {
  var historySection = document.getElementById('history');

  // Retrieve and update the latest history from local storage
  updateHistory();

  // Toggle the visibility of the history section
  historySection.classList.toggle('hidden');
}

// Function to update the history from local storage
function updateHistory() {
  var savedURLs = JSON.parse(localStorage.getItem('savedURLs'));
  var historyContainer = document.getElementById('history-container');
  historyContainer.innerHTML = ''; // Clear existing content

  // Create an unordered list element
  var ul = document.createElement('ul');

  // Iterate through each entry and create list items with links and timestamps
  savedURLs.forEach(function (urlWithTimestamp) {
      var li = document.createElement('li');

      // Split the timestamp and URL
      var parts = urlWithTimestamp.split(', ');
      var timestamp = parts.slice(0, 2).join(', '); // Use the first two parts for timestamp
      var url = parts[2];

      var link = document.createElement('a');

      link.textContent = timestamp + ' - ' + url; // Display timestamp and URL
      link.href = url; // Set the link's href attribute to the URL
      link.target = '_blank'; // Open the link in a new tab

      // Add a click event listener to the link
      link.addEventListener('click', function (event) {
          event.preventDefault();
          openURLInNewTab(url); // Call a function to open the URL in a new tab
      });

      // Append the link to the list item
      li.appendChild(link);
      ul.appendChild(li);
  });

  // Append the list to the history-container
  historyContainer.appendChild(ul);
}

// Add an event listener to the 'View History' button
document.getElementById('view-history').addEventListener('click', function () {
  toggleHistory();
});

// Function to open the URL in a new tab
function openURLInNewTab(url) {
  createTab(url); // Assuming createTab function opens the URL in a new tab
}


