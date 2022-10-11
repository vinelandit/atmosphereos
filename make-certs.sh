#!/bin/bash
IP=$(ipconfig getifaddr en0)
echo $IP
echo ip
hostname="$(ifconfig | grep -A 1 'eth0' | tail -1 | cut -d ':' -f 2 | cut -d ' ' -f 1)"
echo 'Bork: '
echo $ip4
echo '... bark.'
FQDN=$hostname
rm server.key server.crt
openssl genrsa -out server.key 2048
openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=GB/ST=Street/L=City/O=Organisation/OU=Authority/CN=${FQDN}"
openssl x509 -req -days 1024 -in server.csr -signkey server.key -out server.crt
rm server.csr