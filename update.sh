#!/bin/bash
cd /opt/bitnami/whistlerLiftHistory
npm install
pm2 restart whistler-status 