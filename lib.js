// Copyright (c) 2015 Tommy Yu .
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

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
    'mouselock': 'Mouse lock',
    'microphone': 'Microphone',
    'camera': 'Camera',
    'unsandboxedPlugins': 'Unsandboxed plug-in access',
    'automaticDownloads': 'Automatic downloads',

    'contentSettings': 'Content Settings',
    'cannotToggleHere': 'Content Settings cannot be modified for this page.',
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
    label.textContent = (label_text[type] || type) + ':';
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
