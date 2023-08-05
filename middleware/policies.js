const { match } = require("path-to-regexp");

export default (routes, policyMap = {}) =>
	async function policies(req, res, next) {
		const { url, path } = req;
		const route = routes.getRouteByPath(path);
		if (!route) return next();

		const execs = Object.keys(policyMap)
			.map((path) => ({ path: path.replace(/\*/g, "(.*)"), ogPath: path }))
			.map(({ path, ogPath }) => ({
				match: match(path, { encode: encodeURI, decode: decodeURIComponent }),
				path,
				ogPath,
			}));

		const promises = new Set();
		for (const exec of execs) {
			if (!exec.match(url)) continue;

			const names = Array.isArray(policyMap[exec.ogPath])
				? policyMap[exec.ogPath]
				: [policyMap[exec.ogPath]];

			names
				.map((name) => routes.Policies.findByName(name))
				.filter(Boolean)
				.filter((policy) => route.policy !== policy)
				.map((policy) => policy(req, res))
				.forEach(promises.add, promises);
		}

		if (route.policy) promises.add(route.policy(req, res));

		try {
			await Promise.all(Array.from(promises));
		} catch (err) {
			if (res.renderServerError) {
				return res.renderServerError(err);
			}
			throw err;
		}

		return next();
	};
