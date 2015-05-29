// Copyright (c) 2015 Tommy Yu .
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

document.addEventListener('DOMContentLoaded', function () {
    var details = document.querySelector('#details');
    details.appendChild(createDetailListing());

    var clearSettings = document.querySelector('#clearSettings');
    clearSettings.addEventListener('click', function() {
        // just clear _everything_ indescriminately
        chrome.storage.local.clear();
        types.forEach(function(type) {
            if (chrome.contentSettings[type]) {
                chrome.contentSettings[type].clear(
                    {'scope': 'regular'});
                chrome.contentSettings[type].clear(
                    {'scope': 'incognito_session_only'});
            }
        });
    });
});

// @license-end
