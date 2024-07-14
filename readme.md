### PRODUCTION TEST FOR tkd-athletics.org

## Running the app
navigate to 
```bash
./$ROOT_DIR
```
and run ```bash 
./run.sh --all
```

If you only want to run the client or the server pass in the flags ```bash 
--client
``` 
or 

```bash 
--server
```

## IMPORTANT
If you want the api in the server to work properbly, please create a .env file containg the element MONGODB_URI and pass in the mongodb url running on your localhost.

