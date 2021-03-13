# Generate SQL

Basic transpiler which outputs a SQL string given a structured expression.

## Code

Written in __es6__.

## Commands

- `npm i` to install the project
- `npm run dev` for development purposes
- `npm test` to run the tests ([jest](https://jestjs.io/))

## Method

### Call

```
generateSql(dialect, fields, query);
```

### Dialect support

- `postgres`
- `mysql`
- `sql server`

## Resources

From [challenge](https://gist.github.com/salsakran/73eabd4943eccc397a2af618789a197a).