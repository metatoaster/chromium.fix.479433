// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var incognito;
var url;
var css;
var types = ['cookies', 'images', 'javascript', 'location', 'plugins',
             'popups', 'notifications', 'fullscreen', 'mouselock',
             'microphone', 'camera', 'unsandboxedPlugins',
             'automaticDownloads'];

function settingChanged() {
    var type = this.id;
    var setting = this.value;
    var pattern = /^file:/.test(url) ? url : url.replace(
        /.*(\:\/\/[^\/]*)\/?.*/, '*$1/*');
    console.log(type+' setting for '+pattern+': '+setting);
    chrome.contentSettings[type].set({
        'primaryPattern': pattern,
        'setting': setting,
        'scope': (incognito ? 'incognito_session_only' : 'regular')
    });
    document.querySelector('dt.' + type).setAttribute('class',
        setting == 'block' ? type + ' block' : type);
}
