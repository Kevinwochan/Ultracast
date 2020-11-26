# Frontend

## Installation
```
npm install
npm start
```

## Development
```
npm install --dev
npm start
```
or run with any of the other react scripts
  ```
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev:build-server": "NODE_ENV=development webpack --config webpack.server.js --mode=development -w",
    "dev:start": "nodemon ./server-build/index.js",
    "dev": "npm-run-all --parallel build dev:*"
  },
```
