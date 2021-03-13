import { QUERIES } from './data';
import { generateSql } from './sql';


QUERIES.forEach(({ title, queries }) => {
	describe(title, () => {
		queries.forEach(({ description, dialect, fields, query, result, error }) => {
			test(`${description || result} (${dialect})`, () => {
				if (error) {
					expect(() => generateSql(dialect, fields, query)).toThrow();
				}
				else {
					expect(generateSql(dialect, fields, query)).toStrictEqual(result);
				}
			});
		});
	});
});
