import Bundle from "@bundlejs/core";

class BundleProxy {
	values = [];

	constructor(bundles, { appBundleName }) {
		this.values = bundles.map(({ name, value, path }) => ({
			path,
			name,
			value,
		}));

		const req = function (path) {
			return this.values.find((bundle) => bundle.path === path)?.value;
		}.bind(this);
		req.keys = this.keys.bind(this);

		return new Bundle(req, { appBundleName });
	}

	keys() {
		return this.values.map((bundle) => bundle.path);
	}
}

export default BundleProxy;
