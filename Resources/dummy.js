var win = Ti.UI.currentWindow;

Ti.API.debug(win.activity);
var win1 = Titanium.UI.createWindow({
    url: 'table_view.js',
    title:'Tab 1',
    backgroundColor:'#fff',
    exitOnClose: true
});

Ti.UI.currentTab.open(win1);
