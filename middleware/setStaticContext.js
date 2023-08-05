export default (app) =>
	app.use((req, res, next) => {
		res.setStaticContext = (data) => {
			req.staticContext = Object.assign({}, req.staticContext || {}, data);
		};
		next();
	});
