Titanium.UI.setBackgroundColor('#000');

var js_file;
if (Titanium.Platform.osname !== 'android') {
    js_file = 'table_view.js';
} else {
    js_file = 'dummy.js';
}

var win1 = Titanium.UI.createWindow({
    url: js_file,
    title:'Tab 1',
    backgroundColor:'#fff'
});
win1.hideTabBar();

var tabGroup = Titanium.UI.createTabGroup();
var tab = Titanium.UI.createTab({  
    window:win1
});

tabGroup.addTab(tab);  
tabGroup.open();

