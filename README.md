# VOffice api

## Setup
* Node: 18
* Yarn
* Docker
* Run: 
  ``` bash 
    cp example.env .env
  ```
  ``` bash 
    Setup db, redis...  
    docker-compose -f ./docker-compose-local.yml up -d 
  ```
  ``` bash 
    Install deps
    yarn install
  ```
  ``` bash 
    Start development
    yarn start:dev
  ```