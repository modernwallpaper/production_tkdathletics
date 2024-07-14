#!/bin/bash

start_server() {
  cd server 
  ./run.sh 
}

start_client() {
  pm2 start http-server --name "client" -- client/dist -p 8000
}

for arg in "$@"
do 
  case "$arg" in
    --all) 
    start_client
    start_server
    echo Client runnning on port: 8000
    echo Server running on port: 3890 
    shift
    ;;
    --server) 
    start_server
    echo Started server on port: 3890
    shift
    ;;
    --client) 
    start_client
    echo Started client on port: 8000
    shift
    ;;
  esac
done
