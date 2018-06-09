# TBAPi [![CodeFactor](https://www.codefactor.io/repository/github/robthr/tbapi/badge)](https://www.codefactor.io/repository/github/robthr/tbapi)

TBAPi is a time based alarm scheduler for use in boarding houses. It includes a web interface and a client (see [tbapi-client](https://github.com/robthr/tbapi-client)).

### Index

-   [Try It Now](#try-it-now)
    -   [Start from Scratch](#start-from-scratch)
    -   [Skip installation](#skip-the-installation)
    -   [Using Docker](#using-docker)
-   [Todo](#todo)

### Try it Now!

Requirements:

-   Node.js
-   npm
-   MongoDB

### Start from scratch (Ubuntu 16.04 LTS)

#### Install node.js and npm

Install the package

    sudo apt-get update
    sudo apt-get install -y nodejs npm

#### Install MongoDB

Add the official MongoDB repository

    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927

Install the package    

    sudo apt-get update
    sudo apt-get install -y mongdb-org

### Skip installation

Clone the repository

    git clone https://github.com/robthr/tbapi

Make sure MongoDB is running

    mongod

Install npm packages

    cd tbapi
    npm i

Start the server

    nodejs start

This starts the web server on port 3000. The [.env.example](https://github.com/robthr/tbapi/blob/master/.env.example) file needs to be populated for the server to run.

### Using Docker

Needs docker and docker-compose installed

Clone repo

    git clone https://github.com/robthr/tbapi
    cd tbapi

Build the container

    docker-compose up --build

### Todo

[See Trello board](https://trello.com/b/wJbxTfny)
