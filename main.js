const { app, BrowserWindow, Menu } = require('electron')

const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
  app.quit()
} else {

	const WebSocketServer = require("ws").Server;
	const WebSocket = require("ws");

	const { networkInterfaces } = require('os');


	var os = require('os');

	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (var k in interfaces) {
		for (var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}

	console.log(addresses);
	var win;

	var lastStep=false;


	var server;

	const { ipcMain } = require('electron')


	var codigoJugador;
	ipcMain.on('asynchronous-message', (event, arg) => {
	  codigoJugador=arg;
	  
	  console.log("Codigo Jugador: " + codigoJugador);
	  
	})


	function createWindow () {
		win = new BrowserWindow({
				width: 1280,
				height: 800,
				maximizable: true,
				resizable: true,
				frame: true,
				transparent: false,
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false
				}
			})
		  
		Menu.setApplicationMenu(null)
		//win.webContents.openDevTools()
		win.loadURL(`file://${__dirname}/usercode.html#${addresses[0]}`);
		
		
		
		win.webContents.on('did-navigate', (e) => {
			
			if (win.webContents.getURL().includes("/viewform?usp")){
				
				win.webContents.executeJavaScript('document.querySelectorAll(".freebirdFormviewerViewNumberedItemContainer")[0].style.display="none";', true);
				win.webContents.executeJavaScript('document.querySelectorAll(".freebirdFormviewerViewNumberedItemContainer")[1].style.display="none";', true);
				win.webContents.executeJavaScript('document.querySelectorAll(".freebirdFormviewerViewNumberedItemContainer")[2].style.display="none";', true);
				win.webContents.executeJavaScript('document.querySelectorAll(".freebirdFormviewerViewNumberedItemContainer")[3].style.display="none";', true);
				win.webContents.executeJavaScript('document.querySelector("div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewNavigationNavControls > div.freebirdFormviewerViewNavigationButtonsAndProgress.hasClearButton > div.freebirdFormviewerViewNavigationClearButton > div > span > span").style.display="none";', true);
				win.webContents.executeJavaScript('document.querySelector(".freebirdFormviewerViewHeaderEmailAndSaveStatusContainer").style.display="none";', true);
				
				
			}
			
			//console.log("lastStep: ", lastStep);
			
			//console.log("url: "+ win.webContents.getURL());
			
			//se si usa prima lo smartphone
			if (win.webContents.getURL().endsWith("1FAIpQLSei9v1LWZ8PtsGEt1FFck6cyzv3tIndEVmvc-mB0SykgsE4Pg/formResponse") && lastStep==false){
				win.loadURL(`file://${__dirname}/desktop-continue.html#NORMAL;${codigoJugador}`);
				lastStep=true;
			} else if (win.webContents.getURL().endsWith("1FAIpQLSewyTRwFEyWm3CExY2XlpOUSqcpXtLmsMBz2jg15z96JZ_XPA/formResponse") && lastStep==true){
				win.loadURL(`file://${__dirname}/thankyou.html`);
			} else if (win.webContents.getURL().endsWith("1FAIpQLSei9v1LWZ8PtsGEt1FFck6cyzv3tIndEVmvc-mB0SykgsE4Pg/formResponse") && lastStep==true){
				win.loadURL(`file://${__dirname}/thankyou.html`);
			} else if (win.webContents.getURL().endsWith("1FAIpQLSewyTRwFEyWm3CExY2XlpOUSqcpXtLmsMBz2jg15z96JZ_XPA/formResponse") && lastStep==false){
				lastStep=true;
				win.loadURL(`file://${__dirname}/qr-continue.html#${addresses[0]};${codigoJugador}`);
			}
			
			
		});
		  
		

	}



	app.whenReady().then(() => {
		createWindow()
	  
	  
		const wss = new WebSocketServer({ port: 8080 });

		wss.on('connection', function connection(ws) {
		 ws.on('message', function incoming(data, isBinary) {
			wss.clients.forEach(function each(client) {
			  if (client.readyState === WebSocket.OPEN) {
				client.send(data, { binary: isBinary });
			  }
			});
		  });

		  ws.send('Connected');
		});
	  
	 
		var http = require("http");
		var fs = require('fs');

		server=http.createServer(function (req, res) {
		  fs.readFile(__dirname + "/hud/" + req.url, function (err,data) {
			if (err) {
			  res.writeHead(404);
			  res.end("Not found");
			  return;
			}
			res.writeHead(200);
			res.end(data);
		  });
		}).listen(8000);
	  

	  
	})



}

