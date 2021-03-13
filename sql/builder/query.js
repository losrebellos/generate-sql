import { DIALECT_POSTGRES, DIALECT_MYSQL, DIALECT_SQLSERVER } from '../../sql';


const getQueryStructure = (dialect) => {
	switch (dialect) {
		case DIALECT_POSTGRES:
		case DIALECT_MYSQL:
			return ['SELECT', '* FROM data', '{where}', '{limit}'];

		case DIALECT_SQLSERVER:
			return ['SELECT', '{limit}', '* FROM data', '{where}'];
	}

	throw new Error(`Invalid dialect: ${dialect}`);
};


export const buildQuery = (dialect, sqlObj) => {
	return getQueryStructure(dialect)
		.map((item) => {
			if (item.startsWith('{') && item.endsWith('}')) {
				const key = item.slice(1, -1);
				if (key in sqlObj) {
					return sqlObj[key];
				}

				return undefined;
			}

			return item;
		})
		.filter(item => !!item)
		.join(' ') + ';';
};
