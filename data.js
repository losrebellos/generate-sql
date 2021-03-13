import { DIALECT_POSTGRES, DIALECT_MYSQL, DIALECT_SQLSERVER } from './sql';


// Notes
// - https://gist.github.com/salsakran/73eabd4943eccc397a2af618789a197a
// - fixed some issues/typos in the expected results
// - added missing ; at the end of expected results
// - Unsure about the 'Considerations' section


const nil = null;

const fields1 = {
	1: 'id',
	2: 'name'
};

const fields2 = {
	1: 'id',
	2: 'name',
	3: 'date_joined',
	4: 'age'
};

const fields3 = {
	1: null,
	2: undefined
};

export const QUERIES = [{
	title: 'Default',
	queries: [{
		description: 'Default query',
		dialect: DIALECT_POSTGRES,
		result: 'SELECT * FROM data;'
	}, {
		description: 'WHERE',
		dialect: DIALECT_POSTGRES,
		fields: fields1,
		query: {'where': ['=', ['field', 2], 'cam']},
		result: `SELECT * FROM data WHERE name = 'cam';`
	}, {
		description: 'postgres LIMIT',
		dialect: DIALECT_POSTGRES,
		fields: fields1,
		query: {'limit': 20},
		result: 'SELECT * FROM data LIMIT 20;'
	}, {
		description: 'sqlserver TOP',
		dialect: DIALECT_SQLSERVER,
		fields: fields1,
		query: {'limit': 20},
		result: 'SELECT TOP 20 * FROM data;'
	}, {
		description: 'WHERE with LIMIT',
		dialect: DIALECT_MYSQL,
		fields: fields1,
		query: { 'where': ['=', ['field', 2], 'cam'], 'limit': 10 },
		result: `SELECT * FROM data WHERE name = 'cam' LIMIT 10;`
	}, {
		description: 'WHERE with nil',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['=', ['field', 3], nil]},
		result: `SELECT * FROM data WHERE "date_joined" IS NULL;`
	}, {
		description: 'WHERE with >',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['>', ['field', 4], 35]},
		result: `SELECT * FROM data WHERE age > 35;`
	}, {
		description: 'WHERE with AND',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'joe']]},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe';`
	}, {
		description: 'with OR and >',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['or', ['!=', ['field', 3], '2015-11-01'], ['=', ['field', 1], 456]]},
		result: `SELECT * FROM data WHERE "date_joined" <> '2015-11-01' OR id = 456;`
	}]
}, {
	title: 'Hierarchy',
	queries: [{
		description: 'WHERE with multiple AND - 2 levels',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'joe'], ['=', ['field', 3], 'jack']]},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' AND "date_joined" = 'jack';`
	}, {
		description: 'WHERE with multiple AND - 3 levels',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'where': [
				'and',
				['and',
					['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'joe']],
					['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'jack']]
				]
			]
		},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' AND id < 5 AND name = 'jack';`
	}, {
		description: 'WHERE with AND and OR - 2 levels',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['!=', ['field', 3], nil], ['or', ['>', ['field', 4], 25], ['=', ['field', 2], 'Jerry']]]},
		result: `SELECT * FROM data WHERE "date_joined" IS NOT NULL AND (age > 25 OR name = 'Jerry');`
	}, {
		description: 'WHERE with multiple AND and OR - 3 levels',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'where': [
				'and',
				['!=', ['field', 3], nil],
				['or',
					['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'joe']],
					['or', ['<', ['field', 1], 5], ['=', ['field', 2], 'john']],
					['and', ['<', ['field', 1], 5], ['=', ['field', 2], 'jack']]
				]
			]
		},
		result: `SELECT * FROM data WHERE "date_joined" IS NOT NULL AND ((id < 5 AND name = 'joe') OR id < 5 OR name = 'john' OR (id < 5 AND name = 'jack'));`
	}]
}, {
	title: 'Operators',
	queries: [{
		description: '<',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['<', 'id', 5]},
		result: `SELECT * FROM data WHERE id < 5;`
	}, {
		description: '=',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['=', ['field', 3], 25]},
		result: `SELECT * FROM data WHERE "date_joined" = 25;`
	}, {
		description: '= mutiple values',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['=', ['field', 3], 25, 26, 27]},
		result: `SELECT * FROM data WHERE "date_joined" IN (25, 26, 27);`
	}, {
		description: 'Field is null',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['is-empty', ['field', 1]]},
		result: `SELECT * FROM data WHERE id IS NULL;`
	}, {
		description: 'Field is not null',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not-empty', ['field', 1]]},
		result: `SELECT * FROM data WHERE id IS NOT NULL;`
	}, {
		description: 'not =',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not', ['=', ['field', 2], 'cam']]},
		result: `SELECT * FROM data WHERE NOT name = 'cam';`
	}, {
		description: 'Multiple operators',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['!=', ['field', 3], nil], ['or', ['>', ['field', 4], 25], ['=', ['field', 2], 'Jerry']]]},
		result: `SELECT * FROM data WHERE "date_joined" IS NOT NULL AND (age > 25 OR name = 'Jerry');`
	}]
}, {
	title: 'Macros',
	queries: [{
		description: 'Simple',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'macros': {'is_joe': ['=', ['field', 2], 'joe']},
			'where': ['and', ['<', ['field', 1], 5], ['macro', 'is_joe']],
			'limit': 20
		},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' LIMIT 20;`
	}, {
		description: 'Complex',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'macros': {
				'is_joe': ['=', ['field', 2], 'joe'],
				'is_adult': ['>', ['field', 4], 18],
				'is_old_joe': ['and', ['macro', 'is_joe'], ['macro', 'is_adult']]
			},
			'where': ['and', ['<', ['field', 1], 5], ['macro', 'is_old_joe']]
		},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' AND age > 18;`
	}, {
		description: 'Circular dependency',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'macros': {
				'is_good': ['and', ['macro', 'is_decent'], ['>', ['field', 4], 18]],
				'is_decent': ['and', ['macro', 'is_good'], ['<', ['field', 5], 5]]
			},
	 		'where': ['and', ['<', ['field', 1], 5], ['macro', 'is_good']],
	 		'limit': 20
	 	},
	 	error: true
	}]
}, {
	title: 'Optimisation',
	queries: [{
		description: 'Logically false',
		dialect: DIALECT_SQLSERVER,
		fields: {},
		query: {'where': ['is-empty', nil], 'limit': 10},
		result: `SELECT TOP 10 * FROM data;`
	}, {
		description: 'Multiple AND inside NOT',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not', ['and', ['<', ['field', 1], 5], ['and', ['=', ['field', 2], 'joe'], ['=', ['field', 3], 'jack']]]]},
		result: `SELECT * FROM data WHERE NOT (id < 5 AND name = 'joe' AND "date_joined" = 'jack');`
	}, {
		description: '2 NOT',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not', ['not', ['=', ['field', 2], 'cam']]]},
		result: `SELECT * FROM data WHERE name = 'cam';`
	}, {
		description: '3 NOT',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not', ['not', ['not', ['=', ['field', 2], 'cam']]]]},
		result: `SELECT * FROM data WHERE NOT name = 'cam';`
	}, {
		description: '4 NOT',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['not', ['not', ['not', ['not', ['=', ['field', 2], 'cam']]]]]},
		result: `SELECT * FROM data WHERE name = 'cam';`
	}]
}, {
	title: 'Specials',
	queries: [{
		description: 'Quotes for field name',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['=', ['field', 3], 25]},
		result: `SELECT * FROM data WHERE "date_joined" = 25;`
	}, {
		description: 'Backticks for field name',
		dialect: DIALECT_MYSQL,
		fields: fields2,
		query: {'where': ['=', ['field', 3], 25]},
		result: `SELECT * FROM data WHERE \`date_joined\` = 25;`
	}, {
		description: 'WHERE with LIMIT as a string',
		dialect: DIALECT_MYSQL,
		fields: fields1,
		query: { 'where': ['=', ['field', 2], 'cam'], 'limit': '10' },
		result: `SELECT * FROM data WHERE name = 'cam' LIMIT 10;`
	}, {
		description: 'WHERE with missing value',
		dialect: DIALECT_MYSQL,
		fields: fields1,
		query: { 'where': ['=', ['field', 2]] },
		result: `SELECT * FROM data WHERE name = 'cam' LIMIT 10;`,
		error: true
	}, {
		description: 'AND with only 1 clause',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['<', ['field', 1], 5]], 'limit': 20},
		result: `SELECT * FROM data WHERE id < 5 LIMIT 20;`
	}, {
		description: 'Fields not found',
		dialect: DIALECT_POSTGRES,
		fields: null,
		query: {'where': ['=', ['field', 2], 'cam']},
		result: `SELECT * FROM data WHERE name = 'cam';`,
		error: true
	}, {
		description: 'Field not found',
		dialect: DIALECT_POSTGRES,
		fields: {},
		query: {'where': ['=', ['field', 2], 'cam']},
		result: `SELECT * FROM data WHERE name = 'cam';`,
		error: true
	}, {
		description: 'Macro not found',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {
			'macros': {},
			'where': ['and', ['<', ['field', 1], 5], ['macro', 'is_joe']],
			'limit': 20},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' LIMIT 20;`,
		error: true
	}, {
		description: 'Macros not found',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'where': ['and', ['<', ['field', 1], 5], ['macro', 'is_joe']], 'limit': 20},
		result: `SELECT * FROM data WHERE id < 5 AND name = 'joe' LIMIT 20;`,
		error: true
	}, {
		description: 'Unsupported property',
		dialect: DIALECT_POSTGRES,
		fields: fields2,
		query: {'foo': 10, 'where': ['=', ['field', 2], 'cam'], 'limit': 10},
		result: `SELECT * FROM data WHERE name = 'cam' LIMIT 10;`,
		error: true
	}, {
		description: 'null = null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['=', ['field', 1], nil]},
		result: `SELECT * FROM data;`,
		error: true
	}, {
		description: 'undefined = null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['=', ['field', 2], nil]},
		result: `SELECT * FROM data;`,
		error: true
	}, {
		description: 'null is null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['is-empty', ['field', 1]]},
		result: `SELECT * FROM data;`,
		error: true
	}, {
		description: 'undefined is null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['is-empty', ['field', 2]]},
		result: `SELECT * FROM data;`,
		error: true
	}, {
		description: 'null is not null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['not-empty', ['field', 1]]},
		result: `SELECT * FROM data;`,
		error: true
	}, {
		description: 'undefined is not null',
		dialect: DIALECT_POSTGRES,
		fields: fields3,
		query: {'where': ['not-empty', ['field', 2]]},
		result: `SELECT * FROM data;`,
		error: true
	}]
}];
