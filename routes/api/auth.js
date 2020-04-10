const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../Models/User');
// https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');
const bcryrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server error');
	}
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Please is required').exists(),
	],
	async (req, res) => {
		console.log('req.body', req.body);
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msq: 'Invalid credentials' }] });
			}

			const isMatch = await bcryrpt.compare(password, user.password);

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msq: 'Invalid credentials' }] });
			}

			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtToken'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (error) {
			console.log('Error', error.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
