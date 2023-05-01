const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmailOrUsername = (req, res, next) => {
	User.findOne({
		username: req.body.username,
	}).exec((err, user) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}

		if (user) {
			res.status(400).send({ message: "Failed! Username already in use!" });
			return;
		}
	});

	User.findOne({
		email: req.body.email,
	}).exec((err, email) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}

		if (email) {
			res.status(400).send({ message: "Failed! Email already in use!" });
			return;
		}
	});

	next();
};

checkRoleExisted = (req, res, next) => {
	if (req.body.roles) {
		req.body.roles.forEach((role) => {
			if (!ROLES.includes(role)) {
				res
					.status(400)
					.send({ message: `Failed! Role ${role} does not exist` });
			}
		});

		return;
	}

	next();
};

const verifySignUp = {
	checkDuplicateEmailOrUsername,
	checkRoleExisted,
};

module.exports = verifySignUp;
