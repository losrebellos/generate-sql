import { DIALECT_SQLSERVER } from '../../sql';


export const buildLimit = (dialect, limit) => {
	if (limit !== null && limit !== undefined) {
		if (typeof limit === 'string') {
			limit = parseInt(limit);
		}

		if (typeof limit !== 'number') {
			console.log(error(`Query limit is invalid: ${limit}`));

			return null;
		}

		if (limit <= 0) {
			console.log(warning(`Query limit should be > 0: ${limit}`));

			return null;
		}

		switch (dialect) {
			case DIALECT_SQLSERVER:
				return `TOP ${limit}`;

			default:
				return `LIMIT ${limit}`;
		}
	}

	return null;
};
