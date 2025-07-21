// Initialize Framework7 when DOM is ready
document.addEventListener('DOMContentLoaded', function() {

// Initialize Framework7
var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'Sweet Dreams',
  // App theme
  theme: 'ios',
  // Enable swipe panel
  panel: {
    swipe: true,
  },
  // Add default routes
  routes: [
    {
      path: '/',
      pageName: 'home',
    },
    {
      path: '/history/',
      url: 'pages/history.html',
      on: {
        pageAfterIn: function (e, page) {
          // Load history when page is shown
          if (typeof loadHistory === 'function') {
            loadHistory();
          }
        }
      }
    },
    {
      path: '/info/',
      url: 'pages/info.html',
      on: {
        pageInit: function (e, page) {
          console.log('Info page initialized');
        },
        pageBeforeIn: function (e, page) {
          console.log('Info page before in');
        }
      }
    },
    {
      path: '/settings/',
      url: 'pages/settings.html',
      on: {
        pageInit: function (e, page) {
          loadSettings();
          initSettingsHandlers();
        }
      }
    }
  ],
  // App callbacks
  on: {
    init: function () {
      console.log('Framework7 app initialized');
      // Ensure main view and navbar are visible after initialization
      setTimeout(() => {
        const mainViewEl = document.querySelector('.view-main');
        const navbarEl = document.querySelector('.view-main .navbar');
        
        if (mainViewEl) {
          mainViewEl.style.display = 'block';
          mainViewEl.style.visibility = 'visible';
          mainViewEl.style.opacity = '1';
        }
        
        if (navbarEl) {
          navbarEl.style.display = 'block';
          navbarEl.style.visibility = 'visible';
          navbarEl.style.opacity = '1';
        }
        
        console.log('Main view and navbar visibility forced');
      }, 10);
    }
  }
});

// Skip view creation - let Framework7 handle it automatically
// var mainView;
// setTimeout(() => {
//   mainView = app.views.create('.view-main', {
//     url: '/',
//     animate: false
//   });
  
//   // Force view to be visible and properly rendered
//   if (mainView && mainView.el) {
//     mainView.el.style.display = 'block';
//     mainView.el.style.visibility = 'visible';
//   }
// }, 50);

console.log('Manual view creation disabled - testing auto-init');

// Fix timer route navigation
app.on('pageInit', function() {
  // Add click handler for timer link in menu
  const timerLink = document.querySelector('a[href="/"].panel-close');
  if (timerLink) {
    timerLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Force navigation to home page
      app.views.main.router.navigate('/', {
        reloadCurrent: true,
        clearPreviousHistory: false
      });
    });
  }
});

// Interval configuration based on day
const intervalConfig = {
  1: { checks: [2, 2, 3, 3] },
  2: { checks: [2, 3, 3, 4] },
  3: { checks: [3, 4, 4, 5] },
  4: { checks: [3, 4, 5, 5] },
  5: { checks: [4, 5, 6, 6] }
};

// Timer state
let timerState = {
  isRunning: false,
  isPaused: false,
  currentTime: 0,
  currentCheck: 0,
  currentDay: 1,
  interval: null,
  startTime: null,
  checkStartTime: null,
  sessionLog: []
};

// DOM elements
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const checkBtn = document.getElementById('checkBtn');
const resetQuietBtn = document.getElementById('resetQuietBtn');
const daySelect = document.getElementById('daySelect');
const currentCheckEl = document.getElementById('currentCheck');
const waitTimeEl = document.getElementById('waitTime');
const sessionLogEl = document.getElementById('sessionLog');

// Update timer display
function updateDisplay() {
  const minutes = Math.floor(timerState.currentTime / 60);
  const seconds = timerState.currentTime % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Get current wait time based on day and check number
function getCurrentWaitTime() {
  // Use the actual day if it has config, otherwise use the last available day
  let day = timerState.currentDay;
  if (!intervalConfig[day]) {
    // Find the highest configured day
    const configuredDays = Object.keys(intervalConfig).map(Number).filter(n => !isNaN(n));
    day = Math.max(...configuredDays);
  }
  
  const config = intervalConfig[day];
  const checkIndex = timerState.currentCheck;
  
  if (checkIndex < config.checks.length) {
    return config.checks[checkIndex];
  } else {
    return config.checks[config.checks.length - 1];
  }
}

// Add log entry
function addLogEntry(message) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  const entry = {
    time: time,
    message: message,
    timestamp: now.getTime()
  };
  
  timerState.sessionLog.push(entry);
  updateSessionLog();
  saveSession();
}

// Update session log display
function updateSessionLog() {
  if (timerState.sessionLog.length === 0) {
    sessionLogEl.innerHTML = `
      <div class="empty-state">
        <i class="icon f7-icons">moon_zzz</i>
        <p>Press "Crying" when baby starts crying</p>
      </div>
    `;
  } else {
    sessionLogEl.innerHTML = timerState.sessionLog.map(entry => 
      `<div class="log-entry">
        <span class="time">${entry.time}</span> - ${entry.message}
      </div>`
    ).join('');
    sessionLogEl.scrollTop = sessionLogEl.scrollHeight;
  }
}

// Save session to localStorage
function saveSession() {
  const sessions = JSON.parse(localStorage.getItem('sleepSessions') || '[]');
  const currentSession = {
    date: new Date().toISOString(),
    day: timerState.currentDay,
    log: timerState.sessionLog,
    startTime: timerState.startTime
  };
  
  // Update or add current session
  const todayIndex = sessions.findIndex(s => 
    new Date(s.date).toDateString() === new Date().toDateString()
  );
  
  if (todayIndex >= 0) {
    sessions[todayIndex] = currentSession;
  } else {
    sessions.push(currentSession);
  }
  
  localStorage.setItem('sleepSessions', JSON.stringify(sessions));
}

// Save timer state to localStorage
function saveTimerState() {
  if (timerState.isRunning) {
    const stateToSave = {
      ...timerState,
      savedAt: Date.now()
    };
    localStorage.setItem('timerState', JSON.stringify(stateToSave));
  } else {
    localStorage.removeItem('timerState');
  }
}

// Request notification permission and register service worker
function requestNotificationPermission() {
  // Register service worker first
  if ('serviceWorker' in navigator) {
    // Use different path for dev vs production
    const swPath = window.location.hostname === 'localhost' ? './sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
  
  // Check notification support and show permission UI if needed
  checkNotificationSupport();
}

function checkNotificationSupport() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }
  
  const permission = Notification.permission;
  console.log('Notification permission status:', permission);
  
  // Don't automatically prompt - let users discover notification settings
  // iOS Safari specifically needs user-initiated permission requests
  if (permission === 'denied') {
    console.log('Notifications previously denied');
  }
}

function showNotificationPermissionPrompt() {
  // Show a prominent dialog asking for notification permission
  app.dialog.create({
    title: 'Enable Notifications',
    text: 'Allow notifications to get alerts when timer is ready, even when the app is in the background. This is especially useful on mobile devices.',
    buttons: [
      {
        text: 'Not Now',
        onClick: () => {
          console.log('User declined notifications');
        }
      },
      {
        text: 'Enable',
        bold: true,
        onClick: () => {
          requestNotificationPermissionExplicit();
        }
      }
    ]
  }).open();
}

function requestNotificationPermissionExplicit() {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission result:', permission);
    if (permission === 'granted') {
      app.toast.create({
        text: '✅ Notifications enabled! You\'ll get alerts when timer is ready.',
        position: 'center',
        closeTimeout: 3000
      }).open();
    } else if (permission === 'denied') {
      showNotificationDeniedMessage();
    }
  });
}

function showNotificationDeniedMessage() {
  app.toast.create({
    text: '⚠️ Notifications blocked. Enable in browser settings for timer alerts.',
    position: 'center',
    closeTimeout: 5000
  }).open();
}

function testNotification() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      sendNotification('🔔 Test Notification', 'Notifications are working! You\'ll get alerts when your timer is ready.');
    } else if (Notification.permission === 'default') {
      app.dialog.alert('Please enable notifications first using the "Enable Notifications" button.', 'Notifications Not Enabled');
    } else {
      app.dialog.alert('Notifications are blocked. Please enable them in your browser settings.', 'Notifications Blocked');
    }
  } else {
    app.dialog.alert('This browser doesn\'t support notifications.', 'Not Supported');
  }
}

// Send push notification
function sendNotification(title, message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: '/sweet-dreams/icons/icon.svg',
      badge: '/sweet-dreams/icons/icon.svg',
      tag: 'sleep-timer',
      requireInteraction: true
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }
}

// Service Worker messaging for persistent notifications
function startPersistentNotification() {
  // Don't start persistent notifications if app is visible
  if (document.visibilityState === 'visible') {
    console.log('App is visible, skipping persistent notification');
    return;
  }
  
  if ('serviceWorker' in navigator && timerState.isRunning) {
    const waitMinutes = getCurrentWaitTime();
    const targetTime = waitMinutes * 60;
    
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage({
        type: 'START_PERSISTENT_TIMER',
        data: {
          currentTime: timerState.currentTime,
          targetTime: targetTime,
          checkNumber: timerState.currentCheck + 1,
          dayNumber: timerState.currentDay,
          startTime: Date.now() - (timerState.currentTime * 1000)
        }
      });
    });
  }
}

function stopPersistentNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.active.postMessage({
        type: 'STOP_PERSISTENT_TIMER'
      });
    });
  }
}

// Wake Lock API to keep screen on
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen wake lock acquired');
      
      // Re-acquire wake lock if it's released
      wakeLock.addEventListener('release', () => {
        console.log('Screen wake lock was released');
        // Try to reacquire if timer is still running
        if (timerState.isRunning && document.visibilityState === 'visible') {
          requestWakeLock();
        }
      });
    }
  } catch (err) {
    console.log(`Wake Lock error: ${err.name}, ${err.message}`);
  }
}

async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Screen wake lock released');
  }
}

// Media Session API to show timer as "media playback"
function setupMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `Sleep Timer - Check ${timerState.currentCheck + 1}`,
      artist: `Day ${timerState.currentDay} Training`,
      album: 'Sweet Dreams'
    });
    
    // Set up action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      if (!timerState.isRunning) startTimer();
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
      if (timerState.isRunning) stopTimer();
    });
  }
}

function updateMediaSession() {
  if ('mediaSession' in navigator && timerState.isRunning) {
    const waitMinutes = getCurrentWaitTime();
    const remainingTime = Math.max(0, (waitMinutes * 60) - timerState.currentTime);
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: remainingTime > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')} remaining` : '✓ Ready to check!',
      artist: `Check ${timerState.currentCheck + 1} - Day ${timerState.currentDay}`,
      album: 'Sweet Dreams Sleep Timer'
    });
    
    // Set position state for progress bar
    if (navigator.mediaSession.setPositionState) {
      navigator.mediaSession.setPositionState({
        duration: waitMinutes * 60,
        playbackRate: 1,
        position: timerState.currentTime
      });
    }
  }
}

function cleanupMediaSession() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
  }
}

// Visibility change handling
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // App became visible - stop persistent notifications
    stopPersistentNotification();
    
    // Reacquire wake lock if timer is running
    if (timerState.isRunning) {
      requestWakeLock();
      
      // Recalculate current time based on timestamp
      if (timerState.checkStartTime) {
        const elapsed = Math.floor((Date.now() - timerState.checkStartTime) / 1000);
        timerState.currentTime = elapsed;
        updateDisplay();
        updateMediaSession();
      }
    }
  } else {
    // App became hidden - start persistent notifications
    if (timerState.isRunning) {
      startPersistentNotification();
    }
    
    // Release wake lock when app is hidden
    releaseWakeLock();
  }
});

// Listen for messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'STOP_TIMER_FROM_NOTIFICATION') {
      stopTimer();
    }
  });
}

// Start timer
function startTimer() {
  if (!timerState.isRunning && !startBtn.disabled) {
    // Disable button temporarily to prevent double-clicks
    startBtn.disabled = true;
    setTimeout(() => { startBtn.disabled = false; }, 500);
    
    timerState.isRunning = true;
    // Don't reset currentCheck if we're resuming after stopped crying
    if (timerState.sessionLog.length === 0) {
      // This is a new session
      timerState.currentTime = 0;
      timerState.currentCheck = 0;
      timerState.checkStartTime = Date.now();
      timerState.startTime = new Date().toISOString();
      addLogEntry('Baby started crying - Day ' + timerState.currentDay);
    } else {
      // Resuming after stopped crying - reset timer for current check
      timerState.currentTime = 0;
      timerState.checkStartTime = Date.now(); // Reset start time for new timer
      addLogEntry('Baby started crying again');
    }
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    resetQuietBtn.style.display = 'block';
    checkBtn.disabled = false; // Always enable check button
    
    updateCheckInfo();
    
    timerState.interval = setInterval(() => {
      // Calculate actual elapsed time from start timestamp
      const elapsed = Math.floor((Date.now() - timerState.checkStartTime) / 1000);
      timerState.currentTime = elapsed;
      updateDisplay();
      saveTimerState();
      updateMediaSession(); // Update media session display
      
      const waitMinutes = getCurrentWaitTime();
      const waitSeconds = waitMinutes * 60;
      const remainingTime = waitSeconds - timerState.currentTime;
      
      // Send countdown notifications
      if (remainingTime === 60) {
        sendNotification(
          '⏰ 1 Minute Left',
          `Check ${timerState.currentCheck + 1} - 1 minute remaining`
        );
      } else if (remainingTime === 30) {
        sendNotification(
          '⏰ 30 Seconds Left',
          `Check ${timerState.currentCheck + 1} - 30 seconds remaining`
        );
      } else if (remainingTime === 10) {
        sendNotification(
          '⏰ 10 Seconds Left',
          `Check ${timerState.currentCheck + 1} - Get ready to check!`
        );
      }
      
      if (timerState.currentTime >= waitSeconds) {
        checkBtn.classList.add('color-orange');
        
        // Send notification when timer reaches target (only once)
        if (timerState.currentTime === waitSeconds) {
          sendNotification(
            '⏰ Sleep Timer Ready',
            `Check ${timerState.currentCheck + 1} ready! Wait time of ${waitMinutes} minutes reached.`
          );
        }
      }
    }, 1000);
    
    // Request wake lock to keep screen on
    requestWakeLock();
    
    // Set up media session
    setupMediaSession();
    
    // Start persistent notification only if app is not visible
    if (document.visibilityState !== 'visible') {
      startPersistentNotification();
    }
  }
}

// Stop/Reset timer
function stopTimer() {
  if (timerState.isRunning) {
    // Pause the timer and reset to 0
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    timerState.currentTime = 0;
    checkBtn.classList.remove('color-orange');
    
    // Stop persistent notification
    stopPersistentNotification();
    
    // Release wake lock
    releaseWakeLock();
    
    // Clean up media session
    cleanupMediaSession();
    
    // Update UI to show start button again
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    
    addLogEntry(`Baby stopped crying - Timer paused at check ${timerState.currentCheck + 1}`);
    updateDisplay();
    saveTimerState(); // Clear the saved state since we're paused
  }
}

// Complete session (baby sleeping)
function completeSession() {
  // Always process completion, even if timer is not running
  if (timerState.interval) {
    clearInterval(timerState.interval);
  }
  
  timerState.isRunning = false;
  
  // Stop persistent notification
  stopPersistentNotification();
  
  // Release wake lock
  releaseWakeLock();
  
  // Clean up media session
  cleanupMediaSession();
  
  // Show sleep animation
  showSleepAnimation();
  
  // Add log entry only if there was an active session
  if (timerState.sessionLog.length > 0) {
    addLogEntry('Session completed - Baby sleeping');
  }
  
  // Reset everything
  timerState.currentTime = 0;
  timerState.currentCheck = 0;
  timerState.sessionLog = [];
  
  // Reset UI
  startBtn.style.display = 'block';
  stopBtn.style.display = 'none';
  resetQuietBtn.style.display = 'none';
  checkBtn.disabled = true;
  checkBtn.classList.remove('color-orange');
  
  updateDisplay();
  updateCheckInfo();
  updateSessionLog();
  saveTimerState(); // Clear saved state
}

// Show sleep animation
function showSleepAnimation() {
  const toast = app.toast.create({
    text: '<div style="text-align: center;"><i class="icon f7-icons" style="font-size: 48px;">moon_zzz_fill</i><br>Sweet dreams! 😴</div>',
    position: 'center',
    closeTimeout: 3000,
  });
  toast.open();
}

// Check baby
function checkBaby() {
  const waitMinutes = getCurrentWaitTime();
  const waitedMinutes = Math.floor(timerState.currentTime / 60);
  const isEarly = timerState.currentTime < waitMinutes * 60;
  
  // If checking early, show warning
  if (isEarly) {
    app.dialog.confirm(
      `You've only waited ${waitedMinutes} minutes. Recommended wait time is ${waitMinutes} minutes. Check anyway?`,
      'Early Check Warning',
      () => {
        performCheck(waitedMinutes);
      }
    );
  } else {
    performCheck(waitedMinutes);
  }
}

// Perform the actual check
function performCheck(waitedMinutes) {
  checkBtn.disabled = true;
  checkBtn.classList.remove('color-orange');
  
  addLogEntry(`Check ${timerState.currentCheck + 1} completed (waited ${waitedMinutes} min)`);
  
  // Create dialog with timer
  let comfortTime = 60; // 60 seconds
  let comfortInterval;
  
  // Use setTimeout to ensure previous dialog is fully closed
  setTimeout(() => {
    const dialog = app.dialog.create({
      title: 'Comfort Time',
      text: '<div style="text-align: center; padding: 20px;"><div style="font-size: 48px; font-weight: bold; color: var(--f7-theme-color);" id="comfort-timer">1:00</div><div style="margin-top: 10px;">Maximum comfort time</div></div>',
      buttons: [
        {
          text: 'Done',
          bold: true,
          onClick: function() {
            clearInterval(comfortInterval);
          }
        }
      ],
      on: {
        opened: function() {
          // Start countdown
          comfortInterval = setInterval(() => {
            comfortTime--;
            const minutes = Math.floor(comfortTime / 60);
            const seconds = comfortTime % 60;
            const timerEl = document.getElementById('comfort-timer');
            if (timerEl) {
              timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (comfortTime <= 0) {
              clearInterval(comfortInterval);
              dialog.close();
            }
          }, 1000);
        },
        closed: function() {
          clearInterval(comfortInterval);
          timerState.currentCheck++;
          timerState.currentTime = 0;
          updateCheckInfo();
          addLogEntry('Room left after check');
          
          // Stop the timer after check - assume baby stopped crying
          if (timerState.isRunning) {
            clearInterval(timerState.interval);
            timerState.isRunning = false;
            
            // Stop persistent notification
            stopPersistentNotification();
            
            // Update UI to show start button again
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
            checkBtn.disabled = true;
            checkBtn.classList.remove('color-orange');
            
            updateDisplay();
            saveTimerState(); // Clear the saved state
          }
        }
      }
    });
    
    dialog.open();
  }, 100); // Small delay to ensure proper rendering
}

// Reset timer when baby is quiet (now completes session)
function resetQuiet() {
  completeSession();
}

// Update check info
function updateCheckInfo() {
  currentCheckEl.textContent = timerState.currentCheck + 1;
  waitTimeEl.textContent = getCurrentWaitTime();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
checkBtn.addEventListener('click', checkBaby);
resetQuietBtn.addEventListener('click', resetQuiet);

daySelect.addEventListener('change', (e) => {
  timerState.currentDay = parseInt(e.target.value);
  updateCheckInfo();
  
  // Save selected day
  localStorage.setItem('lastTrainingDay', JSON.stringify({
    day: timerState.currentDay,
    date: new Date().toISOString()
  }));
  
  if (!timerState.isRunning) {
    timerState.sessionLog = [];
    updateSessionLog();
  }
});

// Restore timer state on load
function restoreTimerState() {
  const savedState = localStorage.getItem('timerState');
  if (savedState) {
    const saved = JSON.parse(savedState);
    const elapsedSinceClose = Math.floor((Date.now() - saved.savedAt) / 1000);
    
    // Restore state
    timerState.currentDay = saved.currentDay || 1;
    timerState.currentCheck = saved.currentCheck || 0;
    timerState.sessionLog = saved.sessionLog || [];
    
    // Update UI
    daySelect.value = timerState.currentDay.toString();
    updateCheckInfo();
    updateSessionLog();
    
    // If timer was running, restore it
    if (saved.isRunning && saved.checkStartTime) {
      // Calculate actual elapsed time from the original start time
      const actualElapsed = Math.floor((Date.now() - saved.checkStartTime) / 1000);
      timerState.currentTime = actualElapsed;
      timerState.checkStartTime = saved.checkStartTime;
      timerState.startTime = saved.startTime;
      timerState.isRunning = true;
      
      // Update UI
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      resetQuietBtn.style.display = 'block';
      checkBtn.disabled = false;
      
      const waitMinutes = getCurrentWaitTime();
      const waitSeconds = waitMinutes * 60;
      
      if (timerState.currentTime >= waitSeconds) {
        checkBtn.classList.add('color-orange');
      }
      
      updateDisplay();
      
      // Restart timer with timestamp-based calculation
      timerState.interval = setInterval(() => {
        // Calculate actual elapsed time from start timestamp
        const elapsed = Math.floor((Date.now() - timerState.checkStartTime) / 1000);
        timerState.currentTime = elapsed;
        updateDisplay();
        saveTimerState();
        updateMediaSession();
        
        const waitMinutes = getCurrentWaitTime();
        const waitSeconds = waitMinutes * 60;
        const remainingTime = waitSeconds - timerState.currentTime;
        
        // Send countdown notifications
        if (remainingTime === 60) {
          sendNotification(
            '⏰ 1 Minute Left',
            `Check ${timerState.currentCheck + 1} - 1 minute remaining`
          );
        } else if (remainingTime === 30) {
          sendNotification(
            '⏰ 30 Seconds Left',
            `Check ${timerState.currentCheck + 1} - 30 seconds remaining`
          );
        } else if (remainingTime === 10) {
          sendNotification(
            '⏰ 10 Seconds Left',
            `Check ${timerState.currentCheck + 1} - Get ready to check!`
          );
        }
        
        if (timerState.currentTime >= waitSeconds) {
          checkBtn.classList.add('color-orange');
          
          // Send notification when timer reaches target (only once)
          if (timerState.currentTime === waitSeconds) {
            sendNotification(
              '⏰ Sleep Timer Ready',
              `Check ${timerState.currentCheck + 1} ready! Wait time of ${waitMinutes} minutes reached.`
            );
          }
        }
      }, 1000);
      
      // Restore wake lock and media session
      requestWakeLock();
      setupMediaSession();
      
      // Start persistent notification only if app is not visible
      if (document.visibilityState !== 'visible') {
        startPersistentNotification();
      }
    }
  } else {
    // Load last training day preference if no timer state
    const lastSession = JSON.parse(localStorage.getItem('lastTrainingDay') || '{}');
    if (lastSession.day) {
      timerState.currentDay = lastSession.day;
      daySelect.value = timerState.currentDay.toString();
    }
  }
}

// Splash screen logic
function initSplashScreen() {
  const lastSession = JSON.parse(localStorage.getItem('lastTrainingDay') || '{}');
  const splashModal = document.getElementById('splash-modal');
  
  // Check if modal exists
  if (!splashModal) {
    console.log('Splash modal not found, skipping');
    return;
  }
  
  const splashDaySelect = document.getElementById('splashDaySelect');
  const dayHint = document.getElementById('dayHint');
  const startAppBtn = document.getElementById('startAppBtn');
  
  // Check if required elements exist
  if (!splashDaySelect || !dayHint || !startAppBtn) {
    console.log('Splash modal elements not found, skipping');
    return;
  }
  
  // Auto-suggest next day based on last session
  if (lastSession.date) {
    const lastDate = new Date(lastSession.date);
    const today = new Date();
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    let suggestedDay = lastSession.day || 1;
    
    // If it's a new day, suggest next day
    if (daysSince >= 1 && suggestedDay < 5) {
      suggestedDay = Math.min(suggestedDay + daysSince, 5);
    }
    
    splashDaySelect.value = suggestedDay;
    timerState.currentDay = suggestedDay;
    
    if (daysSince === 0) {
      dayHint.innerHTML = `<small>Continuing from today (Day ${lastSession.day})</small>`;
    } else if (daysSince === 1) {
      dayHint.innerHTML = `<small>Yesterday was Day ${lastSession.day}, suggesting Day ${suggestedDay}</small>`;
    } else {
      dayHint.innerHTML = `<small>Last session was ${daysSince} days ago (Day ${lastSession.day})</small>`;
    }
  } else {
    dayHint.innerHTML = '<small>First time? Start with Day 1</small>';
  }
  
  // Update main day select when splash changes
  splashDaySelect.addEventListener('change', (e) => {
    timerState.currentDay = parseInt(e.target.value);
    const daySelect = document.getElementById('daySelect');
    if (daySelect) {
      daySelect.value = e.target.value;
      updateCheckInfo();
    }
  });
  
  // Start app button
  startAppBtn.addEventListener('click', () => {
    // Save selected day
    localStorage.setItem('lastTrainingDay', JSON.stringify({
      day: timerState.currentDay,
      date: new Date().toISOString()
    }));
    
    // Hide splash modal
    splashModal.style.display = 'none';
  });
  
  // Show splash modal
  splashModal.style.display = 'block';
}

// Settings Management
function loadSettings() {
  const savedSettings = localStorage.getItem('customIntervalConfig');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    // Update the intervalConfig with saved settings
    Object.assign(intervalConfig, settings);
    
    // Update the form fields if on settings page
    const maxDay = getMaxConfiguredDay();
    for (let day = 1; day <= maxDay; day++) {
      const input = document.getElementById(`day${day}`);
      if (input && settings[day]) {
        input.value = settings[day].checks.join(', ');
      }
    }
  }
}

function saveSettings() {
  const newConfig = {};
  
  // Get all day inputs on the page
  const dayInputs = document.querySelectorAll('[id^="day"]');
  
  dayInputs.forEach(input => {
    const dayMatch = input.id.match(/day(\d+)/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1]);
      const values = input.value.split(',').map(v => {
        const num = parseFloat(v.trim());
        return isNaN(num) ? 0 : num;
      }).filter(v => v > 0);
      
      if (values.length > 0) {
        newConfig[day] = { checks: values };
      }
    }
  });
  
  // Save to localStorage
  localStorage.setItem('customIntervalConfig', JSON.stringify(newConfig));
  
  // Clear current intervalConfig and update with new config
  Object.keys(intervalConfig).forEach(key => {
    if (!isNaN(Number(key))) {
      delete intervalConfig[key];
    }
  });
  Object.assign(intervalConfig, newConfig);
  
  // Update day selects in the app
  updateDaySelects();
  
  // Show success message
  app.dialog.alert('Settings saved successfully!', 'Success');
}

function resetToDefaults() {
  // Default interval configuration
  const defaultConfig = {
    1: { checks: [2, 2, 3, 3] },
    2: { checks: [2, 3, 3, 4] },
    3: { checks: [3, 4, 4, 5] },
    4: { checks: [3, 4, 5, 5] },
    5: { checks: [4, 5, 6, 6] }
  };
  
  // Clear localStorage
  localStorage.removeItem('customIntervalConfig');
  
  // Clear current intervalConfig and set to defaults
  Object.keys(intervalConfig).forEach(key => {
    if (!isNaN(Number(key))) {
      delete intervalConfig[key];
    }
  });
  Object.assign(intervalConfig, defaultConfig);
  
  app.dialog.alert('Settings reset to defaults!', 'Reset Complete');
}

function addDayToSettings() {
  const daysList = document.querySelector('#daysList ul');
  const currentMaxDay = getMaxConfiguredDay();
  const newDay = currentMaxDay + 1;
  
  // Create new day elements
  const divider = document.createElement('li');
  divider.className = 'item-divider';
  divider.textContent = `Day ${newDay}`;
  
  const inputItem = document.createElement('li');
  inputItem.className = 'item-content item-input';
  inputItem.innerHTML = `
    <div class="item-inner">
      <div class="item-title item-label">Check intervals (minutes)</div>
      <div class="item-input-wrap">
        <input type="text" id="day${newDay}" placeholder="4, 5, 6, 6" value="">
      </div>
    </div>
  `;
  
  daysList.appendChild(divider);
  daysList.appendChild(inputItem);
}

function getMaxConfiguredDay() {
  const configuredDays = Object.keys(intervalConfig).map(Number).filter(n => !isNaN(n));
  return configuredDays.length > 0 ? Math.max(...configuredDays) : 5;
}

function populateDaySelect(selectElement) {
  if (!selectElement) return;
  
  const currentValue = selectElement.value;
  const maxDay = getMaxConfiguredDay();
  
  // Clear and rebuild options
  selectElement.innerHTML = '';
  
  for (let i = 1; i <= maxDay; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Day ${i}`;
    selectElement.appendChild(option);
  }
  
  // Restore previous selection if still valid
  if (currentValue && currentValue <= maxDay) {
    selectElement.value = currentValue;
  } else {
    selectElement.value = 1;
  }
}

function updateDaySelects() {
  // Update all day select elements
  populateDaySelect(document.getElementById('daySelect'));
  populateDaySelect(document.getElementById('splashDaySelect'));
}

function initSettingsHandlers() {
  // Add extra day fields for any days beyond 5 that are configured
  const maxDay = getMaxConfiguredDay();
  
  if (maxDay > 5) {
    const daysList = document.querySelector('#daysList ul');
    
    for (let day = 6; day <= maxDay; day++) {
      // Create day elements
      const divider = document.createElement('li');
      divider.className = 'item-divider';
      divider.textContent = `Day ${day}`;
      
      const inputItem = document.createElement('li');
      inputItem.className = 'item-content item-input';
      inputItem.innerHTML = `
        <div class="item-inner">
          <div class="item-title item-label">Check intervals (minutes)</div>
          <div class="item-input-wrap">
            <input type="text" id="day${day}" placeholder="4, 5, 6, 6" value="${intervalConfig[day] ? intervalConfig[day].checks.join(', ') : ''}">
          </div>
        </div>
      `;
      
      daysList.appendChild(divider);
      daysList.appendChild(inputItem);
    }
  }
  
  // Handle form submission
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings();
    });
  }
  
  // Handle add day button
  const addDayBtn = document.getElementById('addDayBtn');
  if (addDayBtn) {
    addDayBtn.addEventListener('click', function(e) {
      e.preventDefault();
      addDayToSettings();
    });
  }
  
  // Handle reset button
  const resetBtn = document.getElementById('resetDefaultsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      app.dialog.confirm('Are you sure you want to reset to default settings?', 'Reset Settings', 
        function() {
          resetToDefaults();
          // Reload the page to reset the UI
          window.location.reload();
        }
      );
    });
  }
  
  // Handle notification buttons
  const testNotificationBtn = document.getElementById('testNotificationBtn');
  if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      testNotification();
    });
  }
  
  const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
  if (enableNotificationsBtn) {
    enableNotificationsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      requestNotificationPermissionExplicit();
    });
  }
}

// Initialize
updateDisplay();
updateCheckInfo();
updateSessionLog();
restoreTimerState();

// Load custom settings on app start
loadSettings();

// Update day selects with any extra days from settings
updateDaySelects();

// Request notification permission
requestNotificationPermission();

// Ensure the main interface is properly initialized
setTimeout(() => {
  // Force Framework7 to recalculate and render the main view
  const mainViewEl = document.querySelector('.view-main');
  if (mainViewEl) {
    mainViewEl.style.visibility = 'visible';
    // Since we're using auto-init, no need for manual view updates
    console.log('Main view visibility ensured');
  }
}, 100);

// Show splash screen if no active timer (after header is stable)
setTimeout(() => {
  if (!timerState.isRunning) {
    // Wait for DOM to be fully ready, then try multiple times if needed
    let attempts = 0;
    const tryInitSplash = () => {
      const splashModal = document.getElementById('splash-modal');
      if (splashModal) {
        initSplashScreen();
      } else if (attempts < 10) {
        attempts++;
        console.log(`Splash modal not found, attempt ${attempts}/10`);
        setTimeout(tryInitSplash, 100);
      } else {
        console.log('Splash modal not found after 10 attempts, skipping');
      }
    };
    tryInitSplash();
  }
}, 1000);

}); // End DOMContentLoaded