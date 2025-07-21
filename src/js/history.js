// History page initialization function
function loadHistory() {
  const sessions = JSON.parse(localStorage.getItem('sleepSessions') || '[]');
  const historyList = document.getElementById('historyList');
  
  if (!historyList) return; // Element not found, not on history page
  
  if (sessions.length === 0) {
    historyList.innerHTML = '<p>No sessions saved yet.</p>';
    return;
  }
  
  // Sort sessions by date (newest first)
  sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  historyList.innerHTML = sessions.map(session => {
    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const duration = session.log.length > 0 ? 
      `${session.log.length} checks performed` : 
      'No checks';
    
    const logHtml = session.log.map(entry => 
      `<div class="log-entry">
        <span class="time">${entry.time}</span> - ${entry.message}
      </div>`
    ).join('');
    
    return `
      <div class="history-item">
        <div class="history-date">${dateStr} - Day ${session.day}</div>
        <div class="history-duration">${duration}</div>
        <div class="session-log margin-top">${logHtml}</div>
      </div>
    `;
  }).join('');
}