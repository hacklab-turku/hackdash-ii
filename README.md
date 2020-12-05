# Hackdash II

A simple web based Matrix client for non-interactive info displays. Shows one Matrix room and some additional
information.

## How to use

You need a Matrix account that is on the Matrix room defined in settings. When you open the app you will be asked to 
login to that Matrix account. To logout, you need to clear the browser site data for the app, because there's no 
logout button anywhere (sorry).

## To build

First modify LocalSettings.js to suit your needs.

```bash
$ yarn install
$ yarn build
```

The output is in `public/`

## To develop

Run:

```bash
$ yarn dev
```
