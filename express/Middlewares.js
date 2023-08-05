import { isFunction, isString } from "bundlejs/dist/utils";
import required from "../libs/required";

class Middlewares {
	req;
	globalReq;
	configurations = [];
	global;
	values;
	middlewareMap;

	constructor(middlewares = []) {
		this.values = middlewares.map(({ name, value, priority }) => ({
			name,
			value,
			priority,
		}));
	}

	findByName(name = required`name`) {
		return this.values.find((middleware) => middleware.name === name);
	}

	findByRoute(route = required`route`) {
		const middlewares = route.middleware || [];
		const names = middlewares.filter((middleware) => isString(middleware));
		const functionMiddlewares = middlewares.filter((middleware) =>
			isFunction(middleware)
		);
		return this.values
			.filter((middleware) => names.find((name) => middleware.name === name))
			.map((middleware) => middleware.value)
			.concat(functionMiddlewares);
	}
}

export default Middlewares;
