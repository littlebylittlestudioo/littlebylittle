// public/db.js
// Must be loaded AFTER: firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js

var DB = (function () {
  var _db = null;
  var _initPromise = null;

  /**
   * Initializes Firebase (fetches config from /api/config if not already done)
   * and waits for Firebase Auth to restore session state.
   * Safe to call multiple times — resolves immediately on repeat calls.
   */
  function init() {
    if (_initPromise) return _initPromise;
    _initPromise = fetch('/api/config')
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        if (!firebase.apps.length) {
          firebase.initializeApp(cfg.firebase);
        }
        _db = firebase.firestore();
        // Wait for Firebase Auth to restore session from IndexedDB before
        // resolving, so Firestore security rules see the correct auth.uid.
        return new Promise(function (resolve) {
          var unsub = firebase.auth().onAuthStateChanged(function (user) {
            unsub();
            resolve(user);
          });
        });
      });
    return _initPromise;
  }

  function _userRef(uid) {
    return _db.collection('users').doc(uid);
  }

  function _dateKey(dateStr) {
    return new Date(dateStr).toISOString().slice(0, 10);
  }

  function getLoggedInUid() {
    try {
      var user = JSON.parse(localStorage.getItem('littlebylittle_user') || 'null');
      return (user && user.uid) ? user.uid : null;
    } catch (e) { return null; }
  }

  function isLoggedIn() {
    return localStorage.getItem('littlebylittle_logged_in') === '1' && !!getLoggedInUid();
  }

  /* ── Entries (prompt answers) ── */

  function saveEntry(uid, entry) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    var key = _dateKey(entry.date);
    var doc = Object.assign({}, entry, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    return _userRef(uid).collection('entries').doc(key).set(doc);
  }

  function saveAllEntries(uid, entries) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    if (!entries.length) return Promise.resolve();
    var batch = _db.batch();
    entries.forEach(function (entry) {
      var key = _dateKey(entry.date);
      var ref = _userRef(uid).collection('entries').doc(key);
      batch.set(ref, Object.assign({}, entry, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    });
    return batch.commit();
  }

  function deleteEntry(uid, dateStr) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('entries').doc(_dateKey(dateStr)).delete();
  }

  function getEntries(uid) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('entries').orderBy('date', 'desc').get()
      .then(function (snap) {
        return snap.docs.map(function (d) { return d.data(); });
      });
  }

  /* ── Diary entries ── */

  function saveDiaryEntry(uid, entry) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    var key = _dateKey(entry.date);
    var doc = Object.assign({}, entry, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    return _userRef(uid).collection('diary').doc(key).set(doc);
  }

  function saveAllDiary(uid, entries) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    if (!entries.length) return Promise.resolve();
    var batch = _db.batch();
    entries.forEach(function (entry) {
      var key = _dateKey(entry.date);
      var ref = _userRef(uid).collection('diary').doc(key);
      batch.set(ref, Object.assign({}, entry, { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    });
    return batch.commit();
  }

  function deleteDiaryEntry(uid, dateStr) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('diary').doc(_dateKey(dateStr)).delete();
  }

  function getDiary(uid) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('diary').orderBy('date', 'desc').get()
      .then(function (snap) {
        return snap.docs.map(function (d) { return d.data(); });
      });
  }

  /* ── Meta (bookmarks, setIndex) ── */

  function saveMeta(uid, meta) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('meta').doc('settings').set(meta, { merge: true });
  }

  function getMeta(uid) {
    if (!_db) return Promise.reject(new Error('DB not initialized'));
    return _userRef(uid).collection('meta').doc('settings').get()
      .then(function (doc) { return doc.exists ? doc.data() : null; });
  }

  return {
    init: init,
    getLoggedInUid: getLoggedInUid,
    isLoggedIn: isLoggedIn,
    saveEntry: saveEntry,
    saveAllEntries: saveAllEntries,
    deleteEntry: deleteEntry,
    getEntries: getEntries,
    saveDiaryEntry: saveDiaryEntry,
    saveAllDiary: saveAllDiary,
    deleteDiaryEntry: deleteDiaryEntry,
    getDiary: getDiary,
    saveMeta: saveMeta,
    getMeta: getMeta
  };
})();
