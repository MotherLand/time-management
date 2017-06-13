# Time Management

Simple time management app written in Node and React

  - Type some Markdown on the left
  - See HTML in the right
  - Magic

# What it does

  - Allows users to sign up and keep track of their daily activities
  - Will mark a row red if the total amount of hours worked on that day is less then the desired workload specified during registration
  - Allows USERS to edit their info and tasks, MANAGERS to edit user info, and ADMINS to edit everything

### What it uses

This project was developed with the following tools

* [Node.js] - Web server
* [Express] - awesome web-based text editor
* [JWT] - Authentication tokens
* [Mongo] - Document database
* [Mongoose] - Mongo middleware
* [React] - Front-end
* [Bootstrap] - Basic styling


### Project Structure

| Folder | Description |
| ------ | ------ |
| / | project root |
| /db/seed.js | Initial user, admin and manager data |
| /web/src | ExpressJs app that serves the React app |
| /web/src/app/config/index.jsx | Configuration file |
| /api/src | ExpressJs api |
| /api/src/config/index.js | Configuration file |
| docker-compose.yml | Docker Componse environment definitions |
| Dockerfile-api | Container definitions |
| Dockerfile-web | Container definitions |
| Dockerfile-db | Container definitions |
| env | Environment variables used in the containers |

### Docker Environment deploy

This approach requires [Docker CE](https://store.docker.com/search?type=edition&offering=community) and [Docker Compose V2](https://docs.docker.com/compose/compose-file/compose-file-v2/).

##### The web app will default to port 8001 and the api to 3000

##### The password for the users defined on db/seed.js is 123456
#
From the root directory
```sh
$ docker-compose -f docker-compose.yml up -d
$ docker-compose exec db /bin/bash -r /home/seed.sh
```

### Local Environment deploy

This approach requireds NodeJs v4+, bcrypt, webpack and a Mongodb instance up and running on 127.0.0.1:27017 (see api/src/config/index.js to edit URI and credentials)

Deploy the api
```sh
$ cd api/src
$ npm install bcrypt
$ npm install
```

Deploy the web app
```sh
$ cd web/src
$ npm install
```

Use webpack and npm to fire up local environment

Open your favorite Terminal and run these commands.

First Tab:
```sh
$ cd api/src
$ npm start
```

Second Tab:
```sh
$ cd web/src
$ webpack -w
```

Third Tab:
```sh
$ cd web/src
$ npm start
```

Seed Database:
```sh
$ cd db
$ ./mongo localhost:27017/timemanagement --quiet seed.js
```

API tests:
```sh
$ cd api/src
$ npm test
```

### Todos

 - Write e2e Tests
 - improve redux integration

License
----

MIT

[node.js]: <http://nodejs.org>
[express]: <http://expressjs.com>
[JWT]: <https://jwt.io/>
[mongo]: <https://github.com/mongodb/mongo>
[Mongoose]: <https://github.com/Automattic/mongoose>
[React]: <https://github.com/facebook/react>
[Bootstrap]: <https://github.com/twbs/bootstrap>
   
