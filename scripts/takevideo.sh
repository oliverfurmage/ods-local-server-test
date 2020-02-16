#!/bin/bash

YEAR=$(date +"%Y")
MONTH=$(date +"%m")
DAY=$(date +"%d")
HOUR=$(date +"%H")

DATE=$(date +"%Y-%m-%d_%H%M%s")

TIME=$1;

echo "TAKEVIDEO Record time in minutes: $TIME";

ffmpeg -f video4linux2 -t $TIME -r 5 -s 640x480 -i /dev/video0 /home/pi/FBI/videos/temp/$DATE.avi

mkdir -p "/home/pi/FBI/ods-local-server-test/public/videos/$YEAR/$MONTH/$DAY"

mv /home/pi/FBI/videos/temp/$DATE.avi "/home/pi/FBI/ods-local-server-test/public/videos/$YEAR/$MONTH/$DAY/$HOUR.avi"

echo "TAKEVIDEO Done";