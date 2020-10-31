const temporal = require('temporal');
const five = require('johnny-five');
const { RaspiIO } = require('raspi-io');
const Oled = require('oled-js');
const font = require('oled-font-5x7');

const board = new five.Board({
  io: new RaspiIO(),
});

const ORIGIN_X = 0;
const ORIGIN_Y = 0;
const LINE_HEIGHT = 8

board.on('ready', () => {
  // Initialise the display
  const opts = {
    width: 128,
    height: 64,
    address: 0x3C,
  };

  const oled = new Oled(board, five, opts);

  // Clear the screen
  oled.clearDisplay();
  oled.update();
  
  // Display stats
  temporal.loop(1000, function() {
    oled.clearDisplay();
    
    oled.setCursor(ORIGIN_X, ORIGIN_Y);
    oled.writeString(font, 1, "Hello World", 1, false, 0);
    
    oled.setCursor(ORIGIN_X, ORIGIN_Y + LINE_HEIGHT);
    oled.writeString(font, 1, "RAM: ", 1, false, 0);
  });
});
