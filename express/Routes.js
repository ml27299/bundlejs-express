import Middlewares from "./Middlewares";
import Policies from "./Policies";
import Bundle from "./Bundle";

import required from "../libs/required";
import { fixRouteOrder } from "@bundlejs/core/dist/utils";

const { NODE_ENV } = process.env;
class Routes {
	Middlewares;
	Policies;
	Bundle;
	nonComponentRoutes;

	constructor({
		// rootComponentPath,
		appBundleName,
		bundles = [],
		middlewares = [],
		policies = [],
		nonComponentRoutes = [],
		// middlewarePath,
		// policyPath,
	}) {
		this.nonComponentRoutes = nonComponentRoutes;
		this.Middlewares = new Middlewares(middlewares);
		this.Policies = new Policies(policies);
		this.Bundle = new Bundle(bundles, { appBundleName });

		// this.Bundle = new Bundle(
		// 	requireContext(
		// 		rootComponentPath,
		// 		true,
		// 		new RegExp(escapeStringRegExp(appBundleName))
		// 	),
		// 	{
		// 		appBundleName,
		// 	}
		// );
		console.log("rr:", this.Bundle.routes);
		this.init();
	}

	init() {
		console.log("TITITITITIRTI");
		this.all = fixRouteOrder(
			this.Bundle.routes
				.map((route) =>
					route.ssr === true
						? {
								...route,
								policy: this.Policies?.findByRoute(route),
								middleware: this.Middlewares?.findByRoute(route) || [],
								model: this.Bundle.findModelsByRoute(route),
								meta: this.Bundle.findMetaByRoute(route),
								controller: this.Bundle.findControllersByRoute(route),
								extensions: this.Bundle.findExtensionsByRoute(route),
						  }
						: {
								...route,
								meta: this.Bundle.findMetaByRoute(route),
								policy: this.Policies?.findByRoute(route),
								middleware: this.Middlewares?.findByRoute(route) || [],
						  }
				)
				.concat(this.nonComponentRoutes)
		);
		console.log("all:", this.all);
		this.ssr = this.all
			.filter((route) => route.ssr === true)
			.map((route) => ({
				...route,
				libs: this.Bundle.findLibsByRoute(route),
				component: this.Bundle.findLoadableComponentByRoute(route),
				stores: this.Bundle.findStoresByRoute(route),
				styles: this.Bundle.findStylesByRoute(route),
				constants: this.Bundle.findConstantsByRoute(route),
				background: this.Bundle.findBackgroundByRoute(route),
				//used for development, lets watcher know when to reload
				__serverLoadComponent:
					NODE_ENV === "development" &&
					this.Bundle.findLoadableComponentByRoute(route),
			}));
	}

	__fixRouteOrder(routes = []) {
		if (routes.length === 0) return routes;
		const wildCardRoutes = routes.filter((route) => ~route.path.indexOf(":"));
		const starWildCardRoutes = routes.filter(
			(route) => ~route.path.indexOf("*")
		);
		const regRoutes = routes.filter(
			(route) => !~route.path.indexOf(":") && !~route.path.indexOf("*")
		);
		return regRoutes
			.concat(
				wildCardRoutes.sort((a, b) => {
					const bAddend = ~b.path.indexOf("(") ? 1 : 0;
					const aAddend = ~a.path.indexOf("(") ? 1 : 0;
					return (
						b.path.split(":").length +
						bAddend -
						(a.path.split(":").length + aAddend)
					);
				})
			)
			.concat(
				starWildCardRoutes.sort((a, b) => {
					const bAddend = ~b.path.indexOf("(") ? 1 : 0;
					const aAddend = ~a.path.indexOf("(") ? 1 : 0;
					return (
						b.path.split("*").length +
						bAddend -
						(a.path.split("*").length + aAddend)
					);
				})
			);
	}

	getRouteByPath(path = required`path`) {
		const route = this.ssr.find((route) => route.path === path);
		if (route) return route;
		return this.all.find((route) => route.path === path);
	}
}

export default Routes;
