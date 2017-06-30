set HTTP_PROXY=http://web-proxy.houston.hp.com:8080/
set HTTPS_PROXY=http://web-proxy.houston.hp.com:8080/
call nodist add latest 
call nodist latest 
npm i
set HTTP_PROXY=
set HTTPS_PROXY=
set NODE_ENV=development
set NODE_LOG=true
node server
