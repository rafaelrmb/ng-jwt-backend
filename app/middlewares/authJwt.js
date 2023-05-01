const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
	let token = req.session.token;

	if (!token) {
		return res.status(403).send({ message: "No token provided!" });
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: "Unauthorized!" });
		}

		req.userId = decoded.id;
		next();
	});
};

isAdmin = (req, res, next) => {
	User.findById(req.userId).exec((err, user) => {
		if (err) {
			sendErrorResponse(res, err);
		}

		Role.find(
			{
				_id: { $in: user.roles },
			},
			(err, roles) => {
				if (err) {
					sendErrorResponse(res, err);
				}

				roles.includes("admin")
					? next()
					: res.status(403).send({ message: "Require Admin Role!" });
				return;
			}
		);
	});
};

isModerator = (req, res, next) => {
	User.findById(req.userId).exec((err, user) => {
		if (err) {
			sendErrorResponse(res, err);
		}

		Role.find(
			{
				_id: { $in: user.roles },
			},
			(err, roles) => {
				if (err) {
					sendErrorResponse(res, err);
				}

				roles.includes("moderator")
					? next()
					: res.status(403).send({ message: "Require Moderator Role!" });
				return;
			}
		);
	});
};

function sendErrorResponse(res, err) {
	res.status(500).send({ message: err });
	return;
}

const authJwt = {
	verifyToken,
	isAdmin,
	isModerator,
};

module.exports = authJwt;
