export const populateMacros = (macros, where, macrosList = []) => {
	if (where && where.length > 1) {
		return where.map((argument) => {
			if (Array.isArray(argument)) {
				// type field
				if (typeof argument[0] === 'string' && argument[0] === 'macro') {
					// too many arguments
					if (argument.length > 2) {
						console.warn(`'macro' should be of the form ["macro", <string>]:`, argument);
					}

					// update macros list
					const macroName = argument[1];
					if (macrosList.indexOf(macroName) === -1) {
						macrosList.push(argument[1]);
					}
					else {
						throw new Error(`Circular dependency found in macros: '${macroName}'`);
					}

					// no macros
					if (!macros) {
						throw new Error(`Macros not found`);
					}

					// macro
					const macro = macros[macroName];
					if (!macro) {
						throw new Error(`Macro not found: '${macroName}'`);
					}

					// nested macros
					return populateMacros(macros, macro, macrosList);
				}

				// nothing to populate
				return populateMacros(macros, argument, macrosList);
			}

			return argument;
		});
	}

	return where;
};


export const populateFields = (fields, where) => {
	if (where && where.length > 1) {
		return where.map((argument) => {
			if (Array.isArray(argument)) {
				// type field
				if (typeof argument[0] === 'string' && argument[0] === 'field') {
					// too many arguments
					if (argument.length > 2) {
						console.warn(`'field' should be of the form ["field", <unsigned-int>]:`, argument);
					}

					// no macros
					if (!fields) {
						throw new Error(`Fields not found`);
					}

					// field
					const fieldKey = argument[1];
					const fieldName = fields[fieldKey];

					// invalid field
					if (!fieldName) {
						if (fieldKey in fields) {
							throw new Error(`Invalid field: ('${fieldKey}', '${fieldName}')`);
						}
						else {
							throw new Error(`Field not found with key: '${fieldKey}'`);
						}
					}

					return fieldName;
				}

				// nothing to populate
				return populateFields(fields, argument);
			}

			return argument;
		});
	}

	return where;
};
