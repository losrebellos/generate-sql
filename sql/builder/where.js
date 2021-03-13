import { DIALECT_POSTGRES, DIALECT_MYSQL, DIALECT_SQLSERVER } from '../../sql';


const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

const formatFieldName = (dialect, name) => {
	// if the test for special characters is removed
	// all the fields will be quoted
	if (format.test(name)) {
		switch (dialect) {
			case DIALECT_POSTGRES:
			case DIALECT_SQLSERVER:
				return `"${name}"`;

			case DIALECT_MYSQL:
				return `\`${name}\``;
		}
	}

	return name;
};

const formatValues = (dialect, values) => {
	return values
		// single quotes for all except numbers
		.map(value => isNaN(value) ? `'${value}'` : value);
};


const OPERATORS_SINGLE_ARGUMENT = ['is-empty', 'not-empty'];

const buildExpression = (dialect, clause) => {
	const [operator, name, ...values] = clause;

	// Missing value(s)
	if (OPERATORS_SINGLE_ARGUMENT.indexOf(operator) === -1 && (!values || values.length === 0)) {
		throw new Error(`Missing value(s) for clause: '${operator}' with '${name}'`);
	}

	// formatted
	let fieldOperator = operator.toLowerCase();
	let fieldName = formatFieldName(dialect, name);
	let fieldValues = formatValues(dialect, values);
	let [fieldValue] = fieldValues;

	// update operators
	switch (operator) {
		case '!=':
			if (fieldValues.length > 1) {
				fieldOperator = 'NOT IN';
			}
			else if (fieldValue === null) {
				fieldOperator = 'IS NOT';
			}
			else {
				fieldOperator = '<>';
			}
			break;

		case '=':
			if (fieldValues.length > 1) {
				fieldOperator = 'IN';
			}
			else if (fieldValue === null) {
				fieldOperator = 'IS';
			}
			break;

		case 'is-empty':
			fieldOperator = 'IS';
			break;

		case 'not-empty':
			fieldOperator = 'IS NOT';
			break;
	}

	// update values
	switch (operator) {
		case '!=':
		case '=':
			if (fieldValues.length > 1) {
				fieldValues = `(${fieldValues.join(', ')})`;
			}
			else if (fieldValue === null) {
				fieldValues = 'NULL';
			}
			break;

		case 'is-empty':
		case 'not-empty':
			fieldValues = 'NULL';
			break;
	}

	return `${fieldName} ${fieldOperator} ${fieldValues}`;
};


const buildClause = (dialect, where, parentOperator = null, macrosHistory = []) => {
	// catering for nested and multiple clauses
	const [operator, ...clauses] = where;
	switch (operator.toLowerCase()) {
		case 'and':
		case 'or':
			let expressions = clauses
				.map(param => buildClause(dialect, param, operator, macrosHistory))
				.join(` ${operator.toUpperCase()} `);

			// if the parent operator is different from the operator (i.e.: and !== or)
			// wrapper the expressions around ()
			if (parentOperator && parentOperator.toLowerCase() !== operator.toLowerCase()) {
				expressions = `(${expressions})`;
			}

			return expressions;

		// Only 1 clause
		case 'not':
			return `NOT ${buildClause(dialect, clauses[0], operator, macrosHistory)}`;
	}

	return buildExpression(dialect, where);
};


export const buildWhere = (dialect, where) => {
	if (where && where.length > 1) {
		const expressions = buildClause(dialect, where);
		if (expressions) {
			// add new dialect support here
			return `WHERE ${expressions}`;
		}
	}

	return null;
};
