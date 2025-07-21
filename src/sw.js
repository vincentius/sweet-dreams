// Service Worker for persistent notifications
const CACHE_NAME = 'sweet-dreams-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle timer notifications
let timerInterval = null;

self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_PERSISTENT_TIMER':
      startPersistentTimer(data);
      break;
    case 'STOP_PERSISTENT_TIMER':
      stopPersistentTimer();
      break;
    case 'UPDATE_TIMER':
      updateTimerNotification(data);
      break;
  }
});

function startPersistentTimer(data) {
  const { currentTime, targetTime, checkNumber, dayNumber } = data;
  
  // Clear any existing timer
  stopPersistentTimer();
  
  // Create persistent notification
  showPersistentNotification(currentTime, targetTime, checkNumber, dayNumber);
  
  // Update every 5 seconds on mobile to reduce spam, every second on desktop
  const updateInterval = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 5000 : 1000;
  
  timerInterval = setInterval(() => {
    // Get updated time from main app via broadcast channel or increment locally
    // For now, we'll increment locally (this could drift from main timer)
    const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
    updateTimerNotification({
      currentTime: currentTime + elapsed,
      targetTime,
      checkNumber,
      dayNumber
    });
  }, updateInterval);
}

function stopPersistentTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Close all sleep timer notifications
  self.registration.getNotifications({ tag: 'sleep-timer-persistent' })
    .then(notifications => {
      notifications.forEach(notification => notification.close());
    });
}

function showPersistentNotification(currentTime, targetTime, checkNumber, dayNumber, isUpdate = false) {
  const remainingTime = Math.max(0, targetTime - currentTime);
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  const title = `Sleep Timer - Check ${checkNumber} (Day ${dayNumber})`;
  const body = remainingTime > 0 
    ? `${minutes}:${seconds.toString().padStart(2, '0')} remaining`
    : '✓ Ready to check!';
  
  // Only buzz on first notification or when timer reaches target
  const shouldBuzz = !isUpdate || remainingTime === 0;
  
  self.registration.showNotification(title, {
    body,
    icon: '/sweet-dreams/icons/icon.svg',
    badge: '/sweet-dreams/icons/icon.svg',
    tag: 'sleep-timer-persistent',
    requireInteraction: true,
    silent: !shouldBuzz,  // Silent for updates, buzz only for initial and ready state
    renotify: isUpdate,   // Allow updating existing notification
    persistent: true,
    actions: [
      {
        action: 'check',
        title: 'Check Baby',
        icon: '/sweet-dreams/icons/icon.svg'
      },
      {
        action: 'stop',
        title: 'Stop Timer',
        icon: '/sweet-dreams/icons/icon.svg'
      }
    ],
    data: {
      currentTime,
      targetTime,
      checkNumber,
      dayNumber,
      url: '/sweet-dreams/',
      isUpdate
    }
  });
}

function updateTimerNotification(data) {
  const { currentTime, targetTime, checkNumber, dayNumber } = data;
  
  // Update existing notification silently (no buzz)
  showPersistentNotification(currentTime, targetTime, checkNumber, dayNumber, true);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'check') {
    // Open app to check page
    event.waitUntil(
      clients.openWindow('/sweet-dreams/#check')
    );
  } else if (event.action === 'stop') {
    // Stop the timer
    stopPersistentTimer();
    // Send message to main app to stop timer
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'STOP_TIMER_FROM_NOTIFICATION' });
        });
      })
    );
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow('/sweet-dreams/')
    );
  }
});