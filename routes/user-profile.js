const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`You're able to access a protected route!`);
});

module.exports = router;