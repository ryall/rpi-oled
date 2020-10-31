const temporal = require('temporal');
const RaspiIO = require('raspi-io').RaspiIO;
const five = require('johnny-five');
const Oled = require('oled-js');

const board = new five.Board({
  io: new RaspiIO(),
});

board.on('ready', () => {
  // Initialise
  const opts = {
    width: 128,
    height: 64,
    address: 0x3C,
  };

  const oled = new Oled(board, five, opts);

  // Draw
  oled.clearDisplay();
});
