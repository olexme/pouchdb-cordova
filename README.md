Examplary cordova app with pouchDB
=====

The app helps to observe memory leaks which happen during sync process of documents with inline attachments (images).
App uses Cordova SQLite Plugin 2 plugin (iOS only) to store data in unlimited and more stable db.


To deploy on ios device
---

Run these commands:

    git clone https://github.com/olexme/pouchdb-cordova.git
    cd pouchdb-cordova
    bower install
    cordova prepare ios
    cordova compile ios --device
    ios-deploy -b platforms/ios/build/device/PouchDBCordova.ipa

Steps to observe leaks
---
    1. start the app and the [pouchdb-server](https://github.com/olexme/pouchdb-server)
    2. set correct ip address of the server
    2. insert 5 documents (adding more can crash the app)
    3. you can restart the app now to eliminate possible leaks caused by inserts in the app
    4. set the ip again
    5. open the pouchdb-cordova/platforms/ios in xcode 
    6. attach to PouchDBCordova process from Debug menu and observe memory usage
    7. start syncing - it should show that 5 docs are synced. 
 
    See memory after the operation, the memory level never goes back to the starting point.
    5 docs it's about 16MB in storage and causes over 200MB leak   
    You can also insert documents from the browser - just open index.html file in Chrome.