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
  ``` bash
  #stripe webhook 
  stripe listen --forward-to localhost:2567/v1/payments/stripe_webhook
  # card test 4242424242424242
  ```
