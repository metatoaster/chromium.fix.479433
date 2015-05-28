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

var option_labels = {
    'allow': 'Allow',
    'block': 'Block',
    'session_only': 'Session only',
    'ask': 'Ask'
};

var options_templates = [
    ['allow', 'block'],
    ['allow', 'session_only', 'block'],
    ['allow', 'ask', 'block'],
    ['allow', 'ask']
];

var options_template_ids = {
    'cookies': 1,
    'location': 2,
    'notifications': 2,
    'mouselock': 2,
    'unsandboxedPlugins': 2,
    'automaticDownloads': 2,
    'fullscreen': 3
};

var icon_map = {
    'javascript': 'script',
    'mouselock': 'mouse_cursor',
    'automaticDownloads': 'downloads',
    'unsandboxedPlugins': 'plugins',
};

var label_text = {
    'cookies': 'Cookies',
    'images': 'Images',
    'javascript': 'Javascript',
    'location': 'Location',
    'plugins': 'Plug-ins',
    'popups': 'Pop-ups',
    'notifications': 'Notifications',
    'fullscreen': 'Full screen',
    'mouselock': 'Disable mouse cursor',
    'microphone': 'Microphone',
    'camera': 'Camera',
    'unsandboxedPlugins': 'Unsandboxed plug-in access',
    'automaticDownloads': 'Automatic downloads'
}

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

function addCssRules(type) {
    var img = icon_map[type] || type;
    css.insertRule('dt.' + type +
        '{ background: url("allowed_' + img + '.png") }',
        css.cssRules.length);
    css.insertRule('dt.block.' + type +
        '{ background: url("blocked_' + img + '.png") }',
        css.cssRules.length);
}

function createSettingLabel(type) {
    var dt = document.createElement('dt');
    var label = document.createElement('label');

    dt.appendChild(label);

    dt.setAttribute('class', type);
    label.textContent = label_text[type] || type;
    label.setAttribute('for', type);
    label.addEventListener('click', function() {
        chrome.tabs.create({'url':
            'chrome://settings/contentExceptions#' + type
        });
    });
    return dt;
}

function createSettingOptions(type) {
    var dd = document.createElement('dd');
    var select = document.createElement('select');
    dd.appendChild(select);

    select.setAttribute('id', type);
    select.setAttribute('disabled', 'disabled');

    var options = options_templates[options_template_ids[type] || 0];
    options.forEach(function(opt) {
        var option = document.createElement('option');
        option.setAttribute('value', opt);
        option.textContent = option_labels[opt] || opt;
        select.appendChild(option);
    });

    select.addEventListener('change', settingChanged);

    return dd;
}

function createSettingFields() {
    var dl = document.createElement('dl');
    types.forEach(function(type) {
        chrome.contentSettings[type] && chrome.contentSettings[type].get({
            'primaryUrl': url,
            'incognito': incognito
        }, function(details) {
            var dt = createSettingLabel(type);
            var dd = createSettingOptions(type);
            dl.appendChild(dt);
            dl.appendChild(dd);
            addCssRules(type);
            if (url.startsWith('chrome://')) {
                // not enabling anything for here.
                return;
            }
            dd.querySelector('select').disabled = false;
            dd.querySelector('select').value = details.setting;
            dt.setAttribute('class',
                details.setting == 'block' ? type + ' block' : type);
        });

    });
    return dl;
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var current = tabs[0];
        incognito = current.incognito;
        url = current.url;
        css = document.querySelector('style').sheet;
        var fieldset = document.getElementById('contentSettings');

        fieldset.appendChild(createSettingFields());

        var site = url.replace(/.*\:\/\/([^\/]*)\/?.*/, '$1');
        if (!url.startsWith('chrome://')) {
            document.getElementById('site').textContent = site;
        }
});
