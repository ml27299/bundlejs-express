const { match } = require("path-to-regexp");

export default (routes, middlewareMap = {}) =>
	async function middleware(req, res, next) {
		const { url } = req;

		const route = routes.getRouteByPath(req.route.path);
		if (!route) return next();

		const configurations = Object.keys(middlewareMap)
			.map((path) => ({ path: path.replace(/\*/g, "(.*)"), ogPath: path }))
			.map(({ path, ogPath }) => ({
				match: match(path, { encode: encodeURI, decode: decodeURIComponent }),
				ogPath,
				path,
			}));

		const promises = new Set();
		const priorityMiddlewares = [];
		for (const configuration of configurations) {
			if (!configuration.match(url)) continue;

			const names = Array.isArray(middlewareMap[configuration.ogPath])
				? middlewareMap[configuration.ogPath]
				: [middlewareMap[configuration.ogPath]];

			names
				.map((name) => routes.Middlewares.findByName(name))
				.filter(Boolean)
				.filter(
					({ value: middleware }) => !route.middleware.includes(middleware)
				)
				.map(({ value: middleware, priority }) => {
					if (priority === undefined) return middleware(route)(req, res);
					priorityMiddlewares.push({ middleware, priority });
				})
				.filter(Boolean)
				.forEach(promises.add, promises);
		}

		route.middleware
			.map((middleware) => middleware(route)(req, res))
			.forEach(promises.add, promises);

		try {
			await Promise.all(Array.from(promises));

			const sortedPriorityMiddlewares = priorityMiddlewares.sort(
				(a, b) => a.priority - b.priority
			);
			for (const { middleware } of sortedPriorityMiddlewares) {
				await middleware(route)(req, res);
			}
		} catch (err) {
			if (res.renderServerError) {
				return res.renderServerError(err);
			}
			throw err;
		}

		return next();
	};
