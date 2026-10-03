// What the page is told about where it is running: in the program, not a
// browser tab (40-web.js shows websites in place here, without the note
// that some will not be shown).
"use strict";
const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("NATIVE_APP", true);
