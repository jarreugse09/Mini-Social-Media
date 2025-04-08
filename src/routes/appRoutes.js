const express = require("express");

const path = require('path');
const { join } = path;

var __filename = __filename;
var __dirname = path.dirname(__filename);


const router = express.Router();

router.route('/').get(
  (async (req, res, next) => {
    res.sendFile(join(__dirname, '..', 'pages', 'login.html'));
  })
);

router.route('/register').get(
  (async (req, res, next) => {
    res.sendFile(join(__dirname, '..', 'pages', 'register.html'));
  })
);


router.route('/dashboard').get(
  (async (req, res, next) => {
    res.sendFile(join(__dirname, '..', 'pages', 'dashboard.html'));
  })
);

module.exports = router;
