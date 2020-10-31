# Raspberry Pi OLED Stats

Script to display RPi stats on an I2C 128x64 OLED display.

## Pre-setup

- Enable I2C on the RPi: `sudo raspi-config`
  - Interface Options > I2C
- [Wire the OLED to the board](https://learn.adafruit.com/monochrome-oled-breakouts/circuitpython-wiring)

## Installation

- Install system dependencies: `sudo apt install python3 python3-pip python3-pil -y`
- Install Python dependencies: `pip3 install adafruit-circuitpython-ssd1306`

## Running

- Run with `python3 oled.py`
