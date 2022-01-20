#!/bin/sh

set -x

git pull

pm2 restart all

