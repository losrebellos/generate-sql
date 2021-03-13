// where/clause -> [operator1, [clause1], [operator2, [clause2, clause3, ...]], ...]
export const optimizer = (where) => {
	if (where && where.length > 1) {
		const [operator, ...clauses] = where;
		switch (operator.toLowerCase()) {
			case 'not': {
				// warning as 'not' should have 1 clause only
				// extra clauses will be ignored
				if (clauses.length > 1) {
					console.warn(`'not' operator has to many clauses`);
				}

				const [subOperator, ...subClauses] = clauses[0];

				// ["not", ["not", x]] -> x
				if (subOperator.toLowerCase() === 'not') {
					return optimizer(subClauses[0]);
				}

				// no optimization
				return ['not', optimizer(clauses[0])];
			}

			case 'and':
			case 'or': {
				let optimizedClauses = [];
				clauses.forEach(clause => {
					const [subOperator, ...subClauses] = clause;

					// ["and", ["and", x, y], z] -> ["and", x, y, z]
					if (subOperator.toLowerCase() === operator.toLowerCase()) {
						optimizedClauses = optimizedClauses.concat(subClauses.map(subClause => optimizer(subClause)));
					}
					// no optimization
					else {
						optimizedClauses.push(optimizer(clause));
					}
				});

				return [operator, ...optimizedClauses];
			}

			case 'is-empty': {
				// warning as 'is-empty' should have 1 clause only
				// extra clauses will be ignored
				if (clauses.length > 1) {
					console.warn(`'is-empty' operator has to many clauses`);
				}

				// optimize out WHERE NULL IS NULL
				const [clause] = clauses;
				if (clause === null || clause === undefined) {
					return undefined;
				}
			}
		}
	}

	return where;
};
