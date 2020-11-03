const _ = require('lodash');
const { timer, concat } = require('rxjs');
const { take, concatMap, delay, repeat } = require('rxjs/operators');
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');
const filesize = require('filesize');
const prettyMS = require('pretty-ms');
const si = require('systeminformation');

// Configurable options
const I2C_BUS_INDEX = 1;
const UPDATE_TIME_OFFSET = 500;
const UPDATE_TIME_MULTIPLIER = 2; // Increase this to lower CPU usage
const WIDTH = 128;
const HEIGHT = 64;
const ADDRESS = 0x3C;
const ORIGIN_X = 0;
const ORIGIN_Y = 0;
const LINE_HEIGHT = 11;
const NETWORK_INTERFACES = { 'eth0': 'ETH', 'wlan0': 'WFI' }; // { 'device': 'display name' }
const STATS = ['host', 'net', 'cpu', 'mem', 'disk', 'uptime'];

// Initialise board
const i2cBus = i2c.openSync(I2C_BUS_INDEX);
const oled = new Oled(i2cBus, {
  width: WIDTH,
  height: HEIGHT,
  address: ADDRESS,
});

// Clear the screen
oled.clearDisplay();
oled.update();

// Hostname processing
const hostname$ = timer(getStartTimeOffset('host'), getScaledUpdateTime(60000));

hostname$.subscribe(async () => {
  const { hostname } = await si.osInfo();

  renderStat(oled, 'host', hostname);
});

// Network interface processing
const net$ = timer(getStartTimeOffset('net'), getScaledUpdateTime(5000));

net$.subscribe(async (index) => {
  const interfaces = await si.networkInterfaces();
  const interfaceName = _.keys(NETWORK_INTERFACES)[index % _.keys(NETWORK_INTERFACES).length];
  const interfaceShortName = NETWORK_INTERFACES[interfaceName];
  const interface = _.filter(interfaces, (interface) => interface.iface === interfaceName);

  renderStat(oled, 'net', `${interfaceShortName} ${interface[0].ip4 || 'Unavailable'}`);
});

// CPU processing
const cpu$ = concat(
  timer().pipe(
    concatMap(async () => {
      const { speedmax, cores, physicalCores } = await si.cpu();

      return `CPU ${speedmax}GHz (${physicalCores}/${cores})`;
    }),
  ),
  timer(getScaledUpdateTime(2500), getScaledUpdateTime(5000)).pipe(
    take(12),
    concatMap(async () => {
      const { avgload, currentload, cpus } = await si.currentLoad();
      const { main: avgtemp } = await si.cpuTemperature();

      return `CPU ${_.round(currentload)}% (${_.round(avgtemp)}C)`;
    }),
  ),
)
.pipe(delay(getStartTimeOffset('cpu')), repeat())
.subscribe((text) => {
  renderStat(oled, 'cpu', text);
});

// RAM processing
const mem$ = timer(getStartTimeOffset('mem'), getScaledUpdateTime(5000));

mem$.subscribe(async () => {
  const { total, free, used } = await si.mem();
  const percent = _.round((used / total) * 100);

  renderStat(oled, 'mem', `MEM ${formatFilesize(used)}/${formatFilesize(total)} ${percent}%`);
});

// Disk processing
const disk$ = timer(getStartTimeOffset('disk'), getScaledUpdateTime(10000));

disk$.subscribe(async () => {
  // Too slow, so using an alternative
  const disks = await si.fsSize(); 
  const disk = disks[0];

  renderStat(oled, 'disk', `DSK ${formatFilesize(disk.used)}/${formatFilesize(disk.size)} ${_.round(disk.use)}%`);
});

// Uptime processing
const uptime$ = timer(getStartTimeOffset('uptime'), getScaledUpdateTime(5000));

uptime$.subscribe(async () => {
  const { uptime } = await si.time();

  renderStat(oled, 'uptime', `UPT ${prettyMS(uptime * 1000)}`);
});

function renderStat(oled, key, text) {
  const index = _.indexOf(STATS, key);

  oled.fillRect(ORIGIN_X, ORIGIN_Y + (LINE_HEIGHT * index), WIDTH, LINE_HEIGHT, 0);
  oled.setCursor(ORIGIN_X, ORIGIN_Y + (LINE_HEIGHT * index));
  oled.writeString(font, 1, text, 1, false, 0);
}

function getStartTimeOffset(key) {
  return _.indexOf(STATS, key) * UPDATE_TIME_OFFSET;
}

function getScaledUpdateTime(time) {
  return _.round(time * UPDATE_TIME_MULTIPLIER);
}

function formatFilesize(size) {
  return _.replace(filesize(size, { round: 0 }), ' ', '');
}
