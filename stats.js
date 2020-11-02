const _ = require('lodash');
const os = require('os');
const { timer } = require('rxjs');
const five = require('johnny-five');
const { RaspiIO } = require('raspi-io');
const Oled = require('oled-js');
const filesize = require('filesize');
const prettyMS = require('pretty-ms');
const si = require('systeminformation');
const font = require('oled-font-5x7');

const board = new five.Board({
  io: new RaspiIO(),
});

const WIDTH = 128;
const HEIGHT = 64;
const ADDRESS = 0x3C;
const ORIGIN_X = 0;
const ORIGIN_Y = 0;
const LINE_HEIGHT = 11;
const NETWORK_INTERFACES = { 'eth0': 'ETH', 'wlan0': 'WFI' }; // { 'device': 'display name' }

board.on('ready', () => {
  // Initialise the display
  const opts = {
    width: WIDTH,
    height: HEIGHT,
    address: ADDRESS,
  };

  const oled = new Oled(board, five, opts);

  // The stat lines
  const stats = {
    host: '...',
    net: '...',
    ram: '...',
    cpu: '...',
    disk: '...',
    uptime: '...',
  };

  // Clear the screen
  oled.clearDisplay();
  oled.update();

  // Hostname processing
  const hostnameTimer = timer(0, 60000);

  hostnameTimer.subscribe(() => {
    stats.host = os.hostname();
  });

  // Network interface processing
  const netTimer = timer(0, 5000);

  netTimer.subscribe((index) => {
    const interfaces = os.networkInterfaces();
    const interfaceName = _.keys(NETWORK_INTERFACES)[index % _.keys(NETWORK_INTERFACES).length];
    const interfaceShortName = NETWORK_INTERFACES[interfaceName];
    const interface = interfaces[interfaceName];

    stats.net = `${interfaceShortName} ${interface[0].address || 'Unavailable'}`;
  });
  
  // RAM processing
  const ramTimer = timer(0, 500);

  ramTimer.subscribe(async () => {
    const { total, free, used } = await si.mem();
    const percent = Math.round((used / total) * 100);

    stats.ram = `MEM ${formatFilesize(used)}/${formatFilesize(total)} ${percent}%`;
  });

  // CPU processing
  const cpuTimer = timer(0, 500);

  cpuTimer.subscribe(async (index) => {
    const { brand, speed, cores } = await si.cpu();
    const { avgload, currentload, cpus } = await si.currentLoad();
    
    switch (index % 2) {
      case 0: 
        stats.cpu = `CPU ${_.round(currentload)}% ${_.round(avgload)}% (${cores})`;
        break;
      case 1:
        stats.cpu = `CPU ${brand} ${speed}GHz`;
        break;
    }
  });

  // Disk processing
  const diskTimer = timer(0, 10000);

  diskTimer.subscribe(() => {
    stats.disk = `DSK `;
  });

  // Uptime processing
  const uptimeTimer = timer(0, 1000);

  uptimeTimer.subscribe(() => {
    const uptime = os.uptime();

    stats.uptime = `UPT ${prettyMS(uptime)}`;
  });
  
  // Render update
  const renderTimer = timer(500, 1000);

  renderTimer.subscribe(() => {
    oled.clearDisplay();

    let index = 0;

    _.forEach(stats, (text, stat) => {
      oled.setCursor(ORIGIN_X, ORIGIN_Y + (LINE_HEIGHT * index++));
      oled.writeString(font, 1, text, 1, false, 0);
    });
  });
});

function formatFilesize(size) { 
  return _.replace(filesize(size, { round: 0 }), ' ', ''); 
}
