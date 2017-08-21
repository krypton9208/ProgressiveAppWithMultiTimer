(function() {
  'use strict';

  var app = {
    isLoading: true,
    localStorage: {},
    visibleClients: {},
    currentClientsList: [],
    timers: [],
    spinner: document.querySelector('.loader'),
    timerTemplate: document.querySelector('.timerTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };

  /*****************************************************************************
   *
   * Methods for dealing with localStorage
   *
   ****************************************************************************/

  app.localStorage.getSingleClient = function (key) {
    return JSON.parse(window.localStorage.getItem(key))
  };

  app.localStorage.saveSingleClient = function (key, client) {
    window.localStorage.setItem(key, JSON.stringify(client));
  };

  app.localStorage.removeSingleClient = function (key) {
    window.localStorage.removeItem(key);
  };

  app.localStorage.getCurrentClientList = function () {
    return JSON.parse(window.localStorage.getItem('currentClientsList'))
  };

  app.localStorage.saveCurrentClientList = function () {
    window.localStorage.setItem('currentClientsList', JSON.stringify(app.currentClientsList));
  };

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('butAdd').addEventListener('click', function() {
    app.toggleAddDialog(true);
  }, {passive: true});

  document.getElementById('butAddClient').addEventListener('click', function() {
    // Add the newly selected city
    app.updateLoading(true);
    var select = document.getElementById('nameOfNewClient');
    var selected = select.value;
    var key = guid();
    app.addNewClient(key, selected);
    app.toggleAddDialog(false);
    document.getElementById('nameOfNewClient').value = '';
  }, {passive: true});

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  }, {passive: true});

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.updateClientCard = function(data) {
    var id = data.id;
    var name = data.name;
    var totalSeconds = app.totalSecondsForClient(id);
    var notEnded = false;

    if (data.timerSessions.length > 0) {
      notEnded = data.timerSessions[data.timerSessions.length -1 ].endTimer === null;
    }

    var client = app.visibleClients[id];
    if (!client) {
      client = app.timerTemplate.cloneNode(true);
      client.classList.remove('timerTemplate');
      client.querySelector('.timerTimeHours').textContent = app.pad(parseInt(totalSeconds/3600));
      client.querySelector('.timerTimeMinutes').textContent = app.pad(parseInt(totalSeconds/60));
      client.querySelector('.timerTimeSeconds').textContent = app.pad(totalSeconds%60);
      client.querySelector('.timerStart').onclick = function () { app.startTimer(id) };
      client.querySelector('.timerEnd').onclick = function () { app.endTimer(id, app.totalSeconds(parseInt(client.querySelector('.timerTimeHours').textContent), parseInt(client.querySelector('.timerTimeMinutes').textContent),  parseInt(client.querySelector('.timerTimeSeconds').textContent))) };
      client.querySelector('.timerRemove').onclick = function () { app.removeTimer(id) };
      client.setAttribute('id', id);
      client.querySelector('#name').textContent = name ;
      client.removeAttribute('hidden');
      app.container.appendChild(client);
      app.visibleClients[id] = client;
      if (notEnded) {
        app.startNewTimerForClient(id, app.totalSecondsForClient(id))
      }
    }

  };

  app.totalSeconds = function (hours, minutes, seconds) {
    return (hours * 3600) + Math.floor(minutes * 60) + seconds
  };

  app.startNewTimerForClient = function (key, totalSeconds) {
    var clientContainer = app.visibleClients[key];
    clientContainer.querySelector('.timerStart').classList.add('hidden');
    clientContainer.querySelector('.timerEnd').classList.remove('hidden');
    clientContainer.querySelector('#running').classList.remove('hidden');
    var i = totalSeconds;
    app.timers[key] = setInterval( function updateText() {
      i++;
      clientContainer.querySelector('.timerTimeHours').textContent = app.pad(parseInt(i/3600));
      clientContainer.querySelector('.timerTimeMinutes').textContent = app.pad(parseInt(i/60));
      clientContainer.querySelector('.timerTimeSeconds').textContent = app.pad(i%60);
    }, 1000);
  };

  app.endTimerForClient = function (key, totalTime) {
    clearInterval(app.timers[key]);
    var clientContainer = app.visibleClients[key];
    clientContainer.querySelector('.timerStart').classList.remove('hidden');
    clientContainer.querySelector('.timerEnd').classList.add('hidden');
    clientContainer.querySelector('#running').classList.add('hidden');
    clientContainer.querySelector('.timerTimeHours').textContent = app.pad(parseInt(totalTime/3600));
    clientContainer.querySelector('.timerTimeMinutes').textContent = app.pad(parseInt(totalTime/60));
    clientContainer.querySelector('.timerTimeSeconds').textContent = app.pad(totalTime%60);
  };

  app.removeTimerForClient = function (key) {
    var clientContainer = app.visibleClients[key];

    clientContainer.parentNode.removeChild(clientContainer);
    app.visibleClients[key] = null;

    app.updateLoading(true);
  };

  app.updateLoading = function (value) {
    if (value) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
    } else {
      app.spinner.removeAttribute('hidden');
      app.container.setAttribute('hidden', true);
    }
    app.isLoading = value;
  };

    /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  app.addNewClient = function(key, label) {
    const client = {
      id: key,
      created: new Date(),
      name: label,
      timerSessions: [],
      totalTime: 0
    };

    app.currentClientsList.push(key);

    app.localStorage.saveSingleClient(key, client);
    app.localStorage.saveCurrentClientList();

    app.updateClientCard(client)
  };

 app.startTimer = function (key) {
   var client = app.localStorage.getSingleClient(key);

   if (!client.timerSessions) client.timerSessions = [];
   client.timerSessions.push({
     startTimer: new Date(),
     endTimer: null
   });

   app.localStorage.saveSingleClient(key, client);

   app.startNewTimerForClient(key, app.totalSecondsForClient(key));
 };

  app.endTimer = function (key, totalSeconds) {
    var client = app.localStorage.getSingleClient(key);

    client.timerSessions[client.timerSessions.length -1].endTimer = new Date();
    client.totalTime = totalSeconds;

    app.localStorage.saveSingleClient(key, client);

    app.endTimerForClient(key, client.totalTime);
  };

  app.removeTimer = function (key) {
    app.updateLoading(false);

    app.currentClientsList.splice(app.currentClientsList.indexOf(key), 1);

    app.localStorage.removeSingleClient(key);
    app.localStorage.saveCurrentClientList();

    app.removeTimerForClient(key)
  };

  app.pad = function pad(val) {
    var valString = val + "";
    if(valString.length < 2)
    {
      return "0" + valString;
    }
    else
    {
      return valString;
    }
  };

  app.totalSecondsForClient = function (key) {
    var totalTime = 0;

    app.localStorage.getSingleClient(key).timerSessions.forEach( function (e) {
      if (e === undefined) return;
      if (e.endTimer === null) {
        totalTime += app.totalSecondsBetweenDates(new Date(), e.startTimer);
        return;
      }
      totalTime += app.totalSecondsBetweenDates(e.endTimer, e.startTimer);
    });

    return totalTime;
  };

  app.totalSecondsBetweenDates = function (dateFirst, dateSecond) {
    return Math.floor((new Date(dateFirst).getTime() - new Date(dateSecond).getTime()) / 1000);
  };

  app.currentClientsList = app.localStorage.getCurrentClientList();
  if (!app.currentClientsList) {
    app.currentClientsList = [];
    app.updateLoading(true);
  } else {
    app.currentClientsList.forEach( function (client) {
      var value = app.localStorage.getSingleClient(client);
      if (value) {
        app.updateClientCard(value)
      }
    });
    app.updateLoading(true);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(function() {  });
  }

 })();
