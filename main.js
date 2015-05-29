// Copyright (c) 2015 Tommy Yu .
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

var incognito;
var url;
var css;

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var current = tabs[0];
        incognito = current.incognito;
        url = current.url;
        var site = document.getElementById('site');
        if (url.startsWith('chrome://')) {
            site.textContent = label_text['cannotToggleHere'];
            return
        }
        var fieldset = document.getElementById('contentSettings');
        var legend = document.createElement('legend');
        legend.textContent = label_text['contentSettings'];
        fieldset.appendChild(legend);
        css = document.querySelector('style').sheet;
        var site = url.replace(/.*\:\/\/([^\/]*)\/?.*/, '$1');
        fieldset.appendChild(createSettingFields());
        document.getElementById('site').textContent = site;
    });
});

// @license-end
