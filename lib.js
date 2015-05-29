// Copyright (c) 2015 Tommy Yu .
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

var types = [
    'cookies',
    'images',
    'javascript',
    'location',
    'plugins',
    'popups',
    'notifications',
    'fullscreen',
    'mouselock',
    'microphone',
    'camera',
    'unsandboxedPlugins',
    'automaticDownloads'
];

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

function saveSetting(type, pattern, setting, incognito) {
    chrome.storage.local.get([type], function(items) {
        chrome.contentSettings[type].set({
            'primaryPattern': pattern,
            'setting': setting,
            'scope': (incognito ? 'incognito_session_only' : 'regular')
        });
        // setting this after because whenever users request to remove a
        // rule, if the following fails (such as due to out of storage)
        // the rules that failed to be saved simply won't be restored,
        // rather than the alternative where rules are saved for rules
        // that never have been set properly.
        type_items = items[type] || {};
        type_items[pattern] = [setting, incognito];
        items[type] = type_items;
        chrome.storage.local.set(items);
    });
}

function settingChanged() {
    var type = this.id;
    var setting = this.value;
    var pattern = /^file:/.test(url) ? url : url.replace(
        /.*(\:\/\/[^\/]*)\/?.*/, '*$1/*');
    console.log(type+' setting for '+pattern+': '+setting);
    saveSetting(type, pattern, setting, incognito);
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

function createRuleSection(rules) {
    var result = document.createElement('dl');
    result.setAttribute('class', 'rules');
    for (key in rules) {
        var domain = document.createElement('dt');
        var behavior = document.createElement('dd');
        domain.textContent = key;
        behavior.textContent = option_labels[rules[key][0]];
        result.appendChild(domain);
        result.appendChild(behavior);
    }
    return result;
}

function createDetailSection(type, rules) {
    var result = document.createElement('div');
    var label = document.createElement('label');
    var checkbox = document.createElement('input');

    labeltext = (label_text[type] || type);
    label.textContent = `${label_text[type]} (${Object.keys(rules).length})`;
    label.setAttribute('for', type);
    label.setAttribute('class', 'header');

    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('name', 'menu');
    checkbox.setAttribute('id', type);
    checkbox.setAttribute('class', 'header');

    result.appendChild(checkbox);
    result.appendChild(label);
    result.appendChild(createRuleSection(rules));
    return result;
}

function createDetailListing() {
    var div = document.createElement('div');
    chrome.storage.local.get(null, function(items) {
        types.forEach(function(type) {
            if (chrome.contentSettings[type]) {
                var rules = items[type] || {};
                div.appendChild(createDetailSection(type, rules));
            }
        });
    });
    return div;
}

// @license-end
