"""
Code based on the official documentation at: 
https://learn.adafruit.com/monochrome-oled-breakouts/overview
"""

import time
import board
import digitalio
from PIL import Image, ImageDraw, ImageFont
import adafruit_ssd1306
import subprocess

# Define the Reset Pin
oled_reset = digitalio.DigitalInOut(board.D4)

# Change these
# to the right size for your display!
WIDTH = 128
HEIGHT = 64
X = 0
Y = 0

# Use for I2C.
i2c = board.I2C()
oled = adafruit_ssd1306.SSD1306_I2C(WIDTH, HEIGHT, i2c, addr=0x3C, reset=oled_reset)

# Use for SPI
# spi = board.SPI()
# oled_cs = digitalio.DigitalInOut(board.D5)
# oled_dc = digitalio.DigitalInOut(board.D6)
# oled = adafruit_ssd1306.SSD1306_SPI(WIDTH, HEIGHT, spi, oled_dc, oled_reset, oled_cs)

# Clear display.
oled.fill(0)
oled.show()
    
# Create blank image for drawing.
# Make sure to create image with mode '1' for 1-bit color.
image = Image.new("1", (oled.width, oled.height))

# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)

# Draw a white background
#draw.rectangle((0, 0, oled.width, oled.height), outline=255, fill=255)

# Draw a smaller inner rectangle
#draw.rectangle(
#    (BORDER, BORDER, oled.width - BORDER - 1, oled.height - BORDER - 1),
#    outline=0,
#    fill=0,
#)

# Load default font.
font = ImageFont.load_default()

# Draw Some Text
#text = "Raspberry Pi"
#(font_width, font_height) = font.getsize(text)
#draw.text(
#    (oled.width // 2 - font_width // 2, oled.height // 2 - font_height // 2),
#    text,
#    font=font,
#    fill=255,
#)

while True:
    # Draw a black filled box to clear the image.
    draw.rectangle((0,0,WIDTH,HEIGHT), outline=0, fill=0)
    
    # Get stats
    # https://unix.stackexchange.com/questions/119126/command-to-display-memory-usage-disk-usage-and-cpu-load
    HOSTNAME = subprocess.check_output("hostname", shell = True) 
    IP = subprocess.check_output("hostname -I | cut -d\' \' -f1", shell = True)
    RAM = "N/A"#subprocess.check_output("free -m | awk 'NR==2{printf \"%s/%sMB (%.2f%%)\n\", $3,$2,$3*100/$2}'", shell = True)
    DISK = "N/A"#subprocess.check_output("df -h | awk '$NF=="/"{printf \"%d/%dGB (%s)\n\", $3,$2,$5}'", shell = True)
    CPU = "N/A"#subprocess.check_output("top -bn1 | grep load | awk '{printf \"%.2f\n\", $(NF-2)}'", shell = True)
    
    # Render stats
    draw.text((X, Y), "Host: " + str(HOSTNAME), font=font, fill=255)
    draw.text((X, Y+12), "IP: " + str(IP), font=font, fill=255)
    draw.text((X, Y+24), "CPU: " + str(RAM), font=font, fill=255)
    draw.text((X, Y+36), "RAM: " + str(MEM), font=font, fill=255)
    draw.text((X, Y+48), "Disk: " + str(DISK), font=font, fill=255)
    
    # Display image
    oled.image(image)
    oled.show()
    
    # Wait
    time.sleep(1)
