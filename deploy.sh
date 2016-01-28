#!/bin/bash
cd "$(dirname "$0")"
npm install
cd platforms/es2015
mkdir -p gobem/cache
npm install
cd ../..

rootDir="$(pwd)/platforms"
sed -i "s%/var/www/demo-es2015/platforms%$rootDir%" $(pwd)/config.json

sed -i "s%/var/www/demo-es2015/platforms%$rootDir%" $(pwd)/nginx-demo-es2015.conf
rm -f /etc/nginx/sites-available/nginx-demo-es2015
rm -f /etc/nginx/sites-enabled/nginx-demo-es2015
cp $(pwd)/nginx-demo-es2015.conf /etc/nginx/sites-available/nginx-demo-es2015
ln -s /etc/nginx/sites-available/nginx-demo-es2015 /etc/nginx/sites-enabled/nginx-demo-es2015
service nginx reload
rm -f $(pwd)/nginx-demo-es2015.conf

cp /etc/hosts $(pwd)/hosts.backup
hostsContent=$(grep -v -P '^\s*127\.0\.0\.1\s+es2015\.node\.xyz\s*$' /etc/hosts)
rm -f /etc/hosts
echo "$hostsContent" >> /etc/hosts
echo '127.0.0.1 es2015.node.xyz' >> /etc/hosts
rm -f $(pwd)/hosts.backup

rm -f $(pwd)/deploy.sh
