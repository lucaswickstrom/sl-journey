import kyBase from "ky";

export const ky = kyBase.extend({
	hooks: {
		beforeError: __DEV__
			? [
					(error) => {
						console.debug(error);
						return error;
					},
				]
			: [],
	},
});
