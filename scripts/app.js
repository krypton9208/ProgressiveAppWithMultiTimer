(function() {
  'use strict';

  var app = {
    isLoading: true,
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
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('butAdd').addEventListener('click', function() {
    app.toggleAddDialog(true);
  }, {passive: true});

  document.getElementById('addNewClientForm').addEventListener('submit', function() {
    // Add the newly selected city
    app.updateLoading(true)
    var select = document.getElementById('nameOfNewClient');
    var selected = select.value;
    var key = guid();
    var name = selected;
    app.addNewClient(key, name);
    app.toggleAddDialog(false);
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
    var created = data.created;
    var totalSeconds = data.totalTime;

    var client = app.visibleClients[id];
    if (!client) {
      client = app.timerTemplate.cloneNode(true);
      client.classList.remove('timerTemplate');
      client.querySelector('.timerTimeHours').textContent = pad(parseInt(totalSeconds/3600));
      client.querySelector('.timerTimeMinutes').textContent = pad(parseInt(totalSeconds/60));
      client.querySelector('.timerTimeSeconds').textContent = pad(totalSeconds%60);
      client.querySelector('.timerStart').onclick = function () { app.startTimer(id) };
      client.querySelector('.timerEnd').onclick = function () { app.endTimer(id, parseInt(client.querySelector('.timerTimeHours').textContent * 3600 + client.querySelector('.timerTimeMinutes').textContent * 60 + client.querySelector('.timerTimeSeconds').textContent)) };
      client.querySelector('.timerRemove').onclick = function () { app.removeTimer(id)  }
      client.setAttribute('id', id);
      client.querySelector('#name').textContent = name ;
      client.removeAttribute('hidden');
      app.container.appendChild(client);
      app.visibleClients[id] = client;
    }

  };

  app.startNewTimerForClient = function (key, totalSeconds) {
    var clientContainer = app.visibleClients[key];
    clientContainer.querySelector('.timerStart').classList.add('hidden');
    clientContainer.querySelector('.timerEnd').classList.remove('hidden');
    clientContainer.querySelector('#running').classList.remove('hidden');
    var i = totalSeconds;
    app.timers[key] = setInterval( function () {
      clientContainer.querySelector('.timerTimeHours').textContent = pad(parseInt(i/3600));
      clientContainer.querySelector('.timerTimeMinutes').textContent = pad(parseInt(i/60));
      clientContainer.querySelector('.timerTimeSeconds').textContent = pad(i%60);
      i++
    }, 1000);
  };

  app.endTimerForClient = function (key, totalTime) {
    clearInterval(app.timers[key]);
    var clientContainer = app.visibleClients[key];
    clientContainer.querySelector('.timerStart').classList.remove('hidden');
    clientContainer.querySelector('.timerEnd').classList.add('hidden');
    clientContainer.querySelector('#running').classList.add('hidden');
    clientContainer.querySelector('.timerTimeHours').textContent = pad(parseInt(totalTime/3600));
    clientContainer.querySelector('.timerTimeMinutes').textContent = pad(parseInt(totalTime/60));
    clientContainer.querySelector('.timerTimeSeconds').textContent = pad(totalTime%60);

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

  function pad(val)
  {
    var valString = val + "";
    if(valString.length < 2)
    {
      return "0" + valString;
    }
    else
    {
      return valString;
    }
  }

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
      totalTime: 0
    };

    app.currentClientsList.push(key);

    // TODO add cache logic here
    window.localStorage.setItem(key, JSON.stringify(client));
    window.localStorage.setItem('currentClientsList', JSON.stringify(app.currentClientsList));

    app.updateClientCard(client)
  };

 app.startTimer = function (key) {
   var client = JSON.parse(window.localStorage.getItem(key));

   if (!client.timerSessions) client.timerSessions = [];
   client.timerSessions.push({
     startTimer: new Date(),
     endTimer: null
   });

   window.localStorage.removeItem(key);
   window.localStorage.setItem(key, JSON.stringify(client));

   app.startNewTimerForClient(key, client.totalTime);
 };

  app.endTimer = function (key, totalSeconds) {
    var client = JSON.parse(window.localStorage.getItem(key));

    client.timerSessions[client.timerSessions.length -1 ].endTimer = new Date();
    client.totalTime = totalSeconds;

    window.localStorage.removeItem(key);
    window.localStorage.setItem(key, JSON.stringify(client));

    app.endTimerForClient(key, client.totalTime);
  };

  app.removeTimer = function (key) {
    app.updateLoading(false);

    app.currentClientsList.splice(app.currentClientsList.indexOf(key), 1)

    window.localStorage.removeItem(key);
    window.localStorage.setItem('currentClientsList', JSON.stringify(app.currentClientsList));

    app.removeTimerForClient(key)
  };

  app.currentClientsList = JSON.parse(window.localStorage.getItem('currentClientsList'));
  if (!app.currentClientsList) {
    app.currentClientsList = [];
    app.updateLoading(true);
  } else {
    app.currentClientsList.forEach( function (client) {
      if (JSON.parse(window.localStorage.getItem(client))) {
        app.updateClientCard(JSON.parse(window.localStorage.getItem(client)))
      }
    });
    app.updateLoading(true);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('ProgressiveAppWithMultiTimer/service-worker.js')
      .then(function() {  });
  }

})();
