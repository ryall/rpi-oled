# Raspberry Pi OLED Stats

Script to display RPi stats on an I2C 128x64 OLED display.

## Pre-setup

- Enable I2C on the RPi: `sudo raspi-config`
  - Interface Options > I2C
- [Wire the OLED to the board](https://learn.adafruit.com/monochrome-oled-breakouts/circuitpython-wiring)

## Installation

- Install system dependencies: `sudo apt install -y git nodejs npm pigpio`
- Clone the repository: `git clone https://github.com/ryall/rpi-oled.git`
- Go to the new directory: `cd rpi-oled`
- Install Yarn (optional): `npm i -g yarn`
- Install Node dependencies: `yarn` or `npm i`

## Running

- Run with `node stats.js`
