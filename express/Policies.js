import required from "../libs/required";

class Policies {
	req;
	values;

	constructor(policies = []) {
		this.values = policies.map(({ name, value }) => ({
			name,
			value,
		}));
	}

	findByName(name = required`name`) {
		const policy = this.values.find((policy) => policy.name === name);
		if (!policy) return;
		return policy.value;
	}

	findByRoute(route = required`route`) {
		const name = route.policy;
		const policy = this.values.find((policy) => policy.name === name);
		if (!policy) return;
		return policy.value;
	}
}

export default Policies;
