const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcryrpt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const saltRounds = 10;

// User model
const User = require('../../Models/User');

// https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');

// @route   POST api/users
// @desc    Register user
// @access  Pulblic
router.post(
	'/',
	[
		// Name is required
		check('name', 'Name is required').notEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please include a password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		console.log('req.body', req.body);
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msq: 'User already exists' }] });
			}

			// Get users gravatar
			const avatar = gravatar.url(
				email,
				{
					protocol: 'https',
					s: '200',
					r: 'x',
					d: 'robohash',
				},
				true
			);

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// Encrypt password
			const salt = await bcryrpt.genSalt(saltRounds);
			user.password = await bcryrpt.hash(password, salt);
			await user.save();

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
