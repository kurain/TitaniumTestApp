var win = Ti.UI.currentWindow;

var permalink =
    'http://twitter.com/' + win.screen_name
    + '/status/' + win.status_id;
Ti.API.debug(permalink);

var webView = Ti.UI.createWebView(
    {
        url: permalink
    }
);
win.add(webView);

