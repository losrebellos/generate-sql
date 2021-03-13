import { QUERIES } from './data';
import { generateSql } from './sql';


QUERIES.forEach(({ title, queries }) => {
	console.log(title);

	queries.forEach(({ description, dialect, fields, query, result, error }) => {
		try {
			// generateSql
			const sql = generateSql(dialect, fields, query);
			if (sql === result) {
				console.log(`\t${sql}`);
			}
			else {
				console.error(`\tFail: ${description}\n\t\t- Result: ${sql}\n\t\t- Expected: ${result}`);
			}
		}
		catch (err) {
			if (error) {
				console.error(`\t${err.message}`);
			}
			else {
				console.error(err);
			}
		}

		console.log('');
	});
});
