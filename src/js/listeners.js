omnibox.addEventListener('keydown', (e) => {
  if (e.keyCode === 13) {
    omnibox.blur();
    let val = omnibox.value.trim();

    if (val.startsWith('about:')) {
      switch (val) {
        case 'about:blank':
          view.loadURL('about:blank');
          break;
        case 'about:settings':
          openSettings();
          break;
        case 'about:bookmarks':
          openBookmarks();
          break;
        case 'about:newtab':
          createTab();
          break;
        case 'about:download':
          view.loadURL(defaultHome + 'download');
          break;
        case 'about:github':
          view.loadURL(githubRepo);
          break;
        case 'about:feedback':
          view.loadURL(githubRepo + 'issues/new');
          break;
      }
      return;
    } else if (startsWithScheme(val)) {
      view.loadURL(val);
      return;
    }


    if (/((https?:\/\/)?(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.exec(val)) {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        view.loadURL(val);
      } else {
        view.loadURL('http://'+ val);
      }
    } else {
      const searchurlValue = localStorage.getItem('searchurl');
      if (searchurlValue) {
        view.loadURL(searchurlValue + val);
      } else {
        view.loadURL(defaultEngine + val);
      }
    }
  } 
});


window.addEventListener('offline', () => {
  byId('offline').style.display = 'block';
});


window.addEventListener('online', () => {
  byId('offline').style.display = 'none';
});


byId('settings-presets').addEventListener('change', () => {
  byId('settings-searchurl').value = byId('settings-presets').value;
});



// Add the event listener for keydown events
document.addEventListener('keydown', (e) => {
  if (e.metaKey && e.key === 't') {
    createTab();
  } else if (e.metaKey && e.key === 'w') {
    closeTab();
  }
});



click('update-available', () => {
  byId('update-available').style.display = 'none';
});


click('newtab', () => {
  createTab();
});



click('more-button', toggleMoreMenu);


click('back', () => {
  view.goBack();
});


click('forward', () => {
  view.goForward();
});


click('reload', (e) => {
  if (e.ctrlKey) {
    view.reloadIgnoringCache();
  } else {
    view.reload();
  }
});


click('tabclose', closeTab);


click('menu-inspect', () => {
  view.openDevTools();
  hideMenu();
});


click('menu-reload', () => {
  view.reload();
  hideMenu();
});


click('menu-back', () => {
  view.goBack();
  hideMenu();
});


click('menu-forward', () => {
  view.goForward();
  hideMenu();
});


click('cover', () => {
  const moreMenu = byId('more-menu');
  cover.style.display = 'none';
  if (menu.style.display === 'block') {
    hideMenu();
  }
  if (moreMenu.style.display === 'block') {
    toggleMoreMenu();
  }
});


click('more-settings', openSettings);


click('bookmarks-button', openBookmarks);

click('view-history', toggleHistory);


document.querySelectorAll('#more-menu>ul>li>button').forEach((button) => {
  button.addEventListener('click', toggleMoreMenu);
});


document.querySelectorAll('[data-link]').forEach((link) => {
  link.addEventListener('click', (e) => {
    let prefix = '';
    if (e.target.hasAttribute('data-link-prefix')) {
      switch (e.target.dataset.linkPrefix) {
        case 'home':
          prefix = defaultHome;
          break;
        case 'github':
          prefix = githubRepo;
          break;
      }
    }
    createTab(prefix + e.target.dataset.link);
  });
});


click('settings-done', saveSettings);


click('settings-cancel', hideSettings);


click('offline-retry', () => {
  if (window.navigator.onLine) {
    byId('offline').style.display = 'none';
  }
});


click('bookmarks-close', () => {
  byId('bookmarks').style.display = 'none';
});


click('history-close', () => {
  byId('history').style.display = 'none';
});


click('update-close', () => {
  byId('update-available-updated').style.display = 'none';
});

// Assuming you have the addClickListener function defined as before
const addClickListener = (id, cb) => byId(id).addEventListener('click', (e) => {
  cb(e);
});


// this will help add bookmarks and also unadded them with a name 
addClickListener('bookmark', () => {
  const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
  const currentURL = view.getURL();

  const existingBookmarkIndex = bookmarks.findIndex((bookmark) => bookmark.link === currentURL);

  if (existingBookmarkIndex !== -1) {
    // Bookmark already exists, remove it
    bookmarks.splice(existingBookmarkIndex, 1);

    // Update local storage
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

    // Update the heart icon
    fillHeart(currentURL);
  } else {
    // Bookmark doesn't exist, show the hidden form
    const bookmarkForm = byId('bookmarkForm');
    const saveBookmarkButton = byId('saveBookmarkButton');
    const bookmarkNameInput = byId('bookmarkName');

    // Show the hidden form
    bookmarkForm.style.display = 'block';

    saveBookmarkButton.addEventListener('click', () => {
      const currentName = bookmarkNameInput.value;

      if (!currentName) {
        // Handle empty name
        bookmarkForm.style.display = 'none';
        return;
      }

      // Add the bookmark
      bookmarks.push({ name: currentName, link: currentURL });

      // Update local storage
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

      // Update the heart icon
      fillHeart(currentURL);

      // Hide the form after saving
      bookmarkForm.style.display = 'none';
    });
  }
});






/**
 * Add event listeners to a webview
 * @param {HTMLElement} view - The webview the event listeners will be added to
 * @param {string} hash - The hash of the webview
 */
function addListenersToView(view, hash) {
  let tab = byId('tab-' + hash);

  view.addEventListener('did-stop-loading', () => {
    if (hash === activeHash) {
      setOmnibox(view.getURL());
      checkSSL(view.getURL());
      grayOut();
      fillHeart(view.getURL());
    }
    tab.classList.remove('animate-pulse');
    setTitle(tab, view.getTitle());
    view.insertCSS(`::selection {
      color: white !important;
      background: rgb(99, 102, 241) !important;
    }`);
    
// Log the URL along with date and time when the page stops loading
var currentTimeAndDate = new Date();

// Save the URL, time, and date to local storage as .json under the key 'savedURLs'
saveURLtoLocalStorage(view.getURL(), currentTimeAndDate);

// Function to save URL, time, and date to local storage as .json under the key 'savedURLs'
function saveURLtoLocalStorage(url, timestamp) {
  // Check if the URL is not the excluded one
  if (url !== 'https://hos-os.github.io/AcronSearch/?v=false') {
      // Format the time, date, and URL
      var formattedTime = timestamp.getHours() + ':' + (timestamp.getMinutes() < 10 ? '0' : '') + timestamp.getMinutes();
      var formattedDate = (timestamp.getMonth() + 1) + '/' + timestamp.getDate();
      var formattedURL = url;

      // Retrieve existing data from local storage (if any)
      var existingData = JSON.parse(localStorage.getItem('savedURLs')) || [];

      // Add the formatted time, date, and URL to the array
      existingData.push(formattedTime + ', ' + formattedDate + ' , ' + formattedURL);

      // Save the updated array back to local storage under the key 'savedURLs'
      localStorage.setItem('savedURLs', JSON.stringify(existingData));
  }
}



  });

  view.addEventListener('load-commit', (e) => {
    if (hash === activeHash && e.isMainFrame) {
      setOmnibox(e.url);
    }
  });


  view.addEventListener('did-start-loading', () => {
    tab.classList.add('animate-pulse')
  });


  view.addEventListener('page-title-updated', (e) => {
    setTitle(tab, e.title);
    tab.title = e.title;
  });


  view.addEventListener('context-menu', (e) => {
    menu.style.display = 'block';
    menu.style.left = e.params.x + 'px';
    menu.style.top = e.params.y + 'px';
    cover.style.display = 'block';
  });


  view.addEventListener('new-window', (e) => {
    createTab(e.url);
  });


  view.addEventListener('update-target-url', (e) => {
    if (e.url) {
      target.innerText = e.url;
      target.style.opacity = '1';
    } else {
      if (target.style.opacity) {
        target.style.opacity = '0';
      }
    }
  });


  view.addEventListener('page-favicon-updated', (e) => {
    if (e.favicons.length > 0) {
      let icon = e.favicons[0];
      let img = tab.getElementsByTagName('img')[0];
      img.src = icon;
      favicon = icon;
    }
  });
}


//ssl info page 
const sslButton = document.getElementById('sslButton');
sslButton.addEventListener('click', function() {
  const sslInformationModal = document.getElementById('sslInformation');
  sslInformationModal.classList.remove('hidden');
});
document.getElementById('sslInformation').classList.add('hidden');
document.getElementById('sslInformationClose').addEventListener('click', () => {
  document.getElementById('sslInformation').classList.add('hidden');
});
