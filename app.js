const {app,BrowserWindow} = require("electron")

let browserWindow;

app.on('ready',()=>{
    browserWindow = new BrowserWindow({
        width:600,
        height:800
    })

    browserWindow.loadFile('./index.html')
});


app.on('quit',()=>app.quit());