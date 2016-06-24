/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// just to show a nice output for this demo
// var originalConsoleLog = console.log.bind(console);
// console.log = function (str) {
//   originalConsoleLog(str);
//   display.innerHTML += str + '\n';
// };

var app = {
  // Application Constructor
  initialize: function () {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function () {
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function (id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

app.initialize();

var test = (function() {
  var initialized = false;
  var localDb, remoteDb;
  var remoteDbUrl;
  var syncElement = document.getElementById("syncStatusId");
  var insertedElement = document.getElementById("insertedId");
  var syncCounterElement = document.getElementById("syncCounterId");
  var errorElement = document.getElementById("errID");
  var insertedCnt = 0;
  var syncedCnt = 0;
  var sync;
  var imgData;
  var inserting = false;


  function init() {
    if (initialized) return;

    remoteDbUrl = document.getElementById("remoteDbUrl").value;

    localDb = new PouchDB("local_db");
    remoteDb = new PouchDB(remoteDbUrl);

    initialized = true;
  }

  function convertImgToDataURLviaCanvas(url){
    var img = document.getElementById('anImgId');
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = 768;//this.height;
      canvas.width = 1024;//this.width;
      ctx.drawImage(this, 0, 0);
      imgData = canvas.toDataURL();
      imgData = imgData.replace(/^data:image\/(png|jpeg);base64,/, '');
      canvas = undefined;
      ctx = undefined;
    };
    img.src = url;
  }

  function prepareDocWithAttachment(){
    var doc = {
        _id: undefined,
        title: "Foo",
        "_attachments": {
          "cat.png" : {
            "content_type": 'image/png',
            "data" : imgData
          }
        }
    };

    return doc;
  }

  function insertDocuments(num) {
    var theDoc;
    if (inserting) return;
    inserting = true;
    init();

    theDoc = prepareDocWithAttachment();
    doInsertRecursion(num, theDoc)
  }

  function doInsertRecursion(num, theDoc) {
    if (num > 0) {
      theDoc["_id"] = 'theId' + Date.now();
      remoteDb.put(theDoc).then(function (response) {
        insertedCnt++;
        insertedElement.innerHTML = "inserted " + insertedCnt + " docs";
        doInsertRecursion(num - 1, theDoc);
      }).catch(function (err) {
        errorElement.innerHTML = err;
        console.log(err);
        inserting = false;
      });
    } else {
      inserting = false;
    }
  }

  function startSyncing() {
    if (sync !== undefined) return;
    init();
    sync = PouchDB.sync(localDb, remoteDb, {
      live:  true,
      retry: true,
      pull: {"batches_limit": 10,
             "batch_size": 40},
      "back_off_function": function (delay) {
          console.log("back_off_function");
          return 1000;
      }
    });
    syncElement.className = "blink";
    sync.on('paused', function() {
      syncElement.innerHTML = "sync paused";
    });
    sync.on('active', function() {
      syncElement.innerHTML = "syncing....";
    });
    sync.on('change', function(data) {
      syncedCnt += data.change.docs.length;
      syncCounterElement.innerHTML = "synced " + syncedCnt + " docs";
    });
  }

  function stopSyncing() {
    if (sync !== undefined) {
      sync.cancel();
      syncElement.innerHTML = "sync stopped.";
      syncElement.className = "";
      sync = undefined;
    }
  }

  convertImgToDataURLviaCanvas("cat.jpg");
  return {
    insertDocuments: insertDocuments,
    startSyncing: startSyncing,
    stopSyncing: stopSyncing
  }
})();

