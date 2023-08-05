export default (routes) =>
	async function staticContext(req, res, next) {
		if (!req.staticContext) req.staticContext = {};

		const route = routes.getRouteByPath(req.route.path);
		if (!route) {
			return next();
		}

		req.staticContext.currentRoutePath = route.path;
		if (route.ssr && route.seo)
			req.staticContext.currentRouteBundlePath = route.bundlePath;

		return next();
	};
