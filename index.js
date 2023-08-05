import App from "express";
import required from "./libs/required";

import middleware from "./middleware/middleware";
import policies from "./middleware/policies";
import staticContext from "./middleware/staticContext";
import setStaticContext from "./middleware/setStaticContext";
import validateStaticContext from "./middleware/validateStaticContext";
import Routes from "./express/Routes";

class Express {
	app;

	constructor({
		routes = [],
		appBundleName = required`appBundleName`,
		middlewares = [],
		policies = [],
		bundles = [],
		app,
	}) {
		this.app = app || new App();
		this.routes = new Routes({
			appBundleName,
			nonComponentRoutes: routes,
			middlewares,
			policies,
			bundles,
		});
	}

	build({ renderer = required`renderer`, policySchema, middlewareSchema }) {
		// this.routes.Middlewares.global.forEach((middleware) =>
		// 	middleware.value(this.app, this.routes)
		// );
		setStaticContext(this.app);
		this.__setRoutes(renderer(this.routes), {
			policySchema,
			middlewareSchema,
		});
		return this.app;
	}

	__setRoutes(renderer, { policySchema, middlewareSchema }) {
		this.routes.all.forEach((route) => {
			return this.app[route.method || "get"](
				route.path,
				staticContext(this.routes),
				policies(this.routes, policySchema),
				middleware(this.routes, middlewareSchema),
				route.controller
					? (req, res, next) => {
							Promise.all(
								route.controller
									.flat()
									.map(
										(controller) =>
											new Promise((resolve) =>
												controller.then
													? controller.then(({ default: controllerFn }) =>
															controllerFn(req, res, resolve)
													  )
													: controller(req, res, resolve)
											)
									)
							).then(() => next());
					  }
					: [],
				validateStaticContext(route),
				route.meta ? route.meta : [],
				route.componentPath ? renderer : []
			);
		});
	}
}

export default Express;
