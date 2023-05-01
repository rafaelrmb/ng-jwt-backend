const { authJwt } = require("../middlewares");
const userController = require("../controllers/user.controller");

module.exports = function (app) {
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
		next();

		app.get("/api/test/all", userController.allAccess);

		app.get("/api/test/user", [authJwt.verifyToken], userController.userBoard);

		app.get(
			"api/test/mod",
			[authJwt.isModerator, authJwt.verifyToken],
			userController.moderatorBoard
		);

		app.get(
			"api/test/admin",
			[authJwt.isAdmin, authJwt.verifyToken],
			userController.adminBoard
		);
	});
};
