import { buildLimit } from './builder/limit';
import { buildQuery } from './builder/query';
import { buildWhere } from './builder/where';
import { optimizer } from './optimization';
import { populateMacros, populateFields } from './population';


export const DIALECT_POSTGRES = 'postgres';
export const DIALECT_MYSQL = 'mysql';
export const DIALECT_SQLSERVER = 'sqlserver';


const QUERY_PROPERTIES = ['macros', 'where', 'limit'];

export const generateSql = (dialect, fields = {}, query = {}) => {
	const sqlObj = {};

	if (query) {
		// verified properties
		Object
			.keys(query)
			.forEach((property) => {
				if (QUERY_PROPERTIES.indexOf(property) === -1) {
					throw new Error(`Property '${property}' is not supported`);
				}
			});

		// format params
		query.where = populateMacros(query.macros, query.where);
		query.where = populateFields(fields, query.where);
		query.where = optimizer(query.where);

		// sql string
		sqlObj.where = buildWhere(dialect, query.where);
		sqlObj.limit = buildLimit(dialect, query.limit);
	}

	return buildQuery(dialect, sqlObj);
};
