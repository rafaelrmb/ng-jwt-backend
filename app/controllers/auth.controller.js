const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
	const { username, email, password, roles } = req.body;
	const user = new User({
		username,
		email,
		password: bcrypt.hashSync(password, 10),
	});

	user.save((err, user) => {
		if (err) {
			handleErrorOutput(res, err);
		}

		if (roles) {
			Role.find({
				name: { $in: roles },
			}),
				(err, roles) => {
					if (err) {
						handleErrorOutput(res, err);
					}

					user.roles = roles.map((role) => role._id);
					user.save((err) => {
						if (err) {
							handleErrorOutput(res, err);
						}

						res.send({ message: "User was registered successfully!" });
					});
				};
		} else {
			Role.findOne({ name: "User" }, (err, role) => {
				if (err) {
					handleErrorOutput(res, err);
				}

				user.roles = [role._id];
				user.save((err) => {
					if (err) {
						handleErrorOutput(res, err);
					}
				});

				res.send({ message: "User was registered successfully!" });
			});
		}
	});
};

exports.signin = (req, res) => {
	const { username, password } = req.body;

	User.findOne({
		username,
	})
		.populate("roles", "-__v")
		.exec((err, user) => {
			if (err) {
				handleErrorOutput(res, err);
			}

			if (!user) {
				return res.status(404).send({ message: "User Not found." });
			}

			var passwordIsValid = bcrypt.compareSync(password, user.password);

			if (!passwordIsValid) {
				return res.status(401).send({ message: "Invalid Password!" });
			}

			var token = jwt.sign({ id: user.id }, config.secret, {
				expiresIn: 86400, // 24 hours
			});

			var roles = [];

			for (let i = 0; i < user.roles.length; i++) {
				roles.push("ROLE_" + user.roles[i].name.toUpperCase());
			}

			req.session.token = token;

			res.status(200).send({
				id: user._id,
				username: user.username,
				email: user.email,
				roles,
			});
		});
};

exports.signout = async (req, res) => {
	try {
		req.session = null;
		return res.status(200).send({ message: "You've been signed out!" });
	} catch (err) {
		this.next(err);
	}
};

function handleErrorOutput(res, err) {
	res.status(500).send({ message: err });
	return;
}
