const mysql = require('mysql2');

async function createDatabase(db, name){
  try {
    const sqlCreate = `CREATE DATABASE IF NOT EXISTS ` + name;
    db.query(sqlCreate);
    console.log(`Created "${name}" database`);
    const sqlUse = `USE `+ name;
    db.query(sqlUse);
  }catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

async function migrateCategories(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS categories (
    id INT NOT NULL AUTO_INCREMENT, name VARCHAR(250) NOT NULL, PRIMARY KEY (id),
    UNIQUE KEY name(name)
  );`;

    db.query(sql);

    console.log('Created "categories" table');
  } catch (error) {
    console.error('Error migrating categories:', error);
    throw error;
  }
}

async function migrateProducts(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS products (
    id INT NOT NULL AUTO_INCREMENT, categoryId INT NOT NULL, name VARCHAR(250) NOT NULL,
    PRIMARY KEY (id), UNIQUE KEY name(name), INDEX categoryId (categoryId),
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
  );`;

    db.query(sql);

    console.log('Created "products" table');
  } catch (error) {
    console.error('Error migrating products:', error);
    throw error;
  }
}

async function migrateShoppingList(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS shopping_list (
    id INT NOT NULL AUTO_INCREMENT, date DATE, text VARCHAR(250),
    PRIMARY KEY (id)
  );`;

    db.query(sql);

    console.log('Created "shopping_list" table');
  } catch (error) {
    console.error('Error migrating shopping_list:', error);
    throw error;
  }
}

async function migrateShoppingListRows(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS shopping_list_rows (
    id INT NOT NULL AUTO_INCREMENT, listId INT NOT NULL, productId INT NOT NULL,
    rowIndex INT NOT NULL, quantity TINYINT UNSIGNED NOT NULL, isChecked TINYINT(1) NOT NULL,
    PRIMARY KEY (id), INDEX prod_ind (productId), INDEX list_ind (listId), INDEX row_ind(rowIndex),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (listId) REFERENCES shopping_list(id) ON DELETE RESTRICT
  );`;

    db.query(sql);

    console.log('Created "shopping_list_rows" table');
  } catch (error) {
    console.error('Error migrating shopping_list_rows:', error);
    throw error;
  }
}

async function migrateOldShoppingList(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS old_shopping_list (
    id INT NOT NULL AUTO_INCREMENT, date DATE, text VARCHAR(250),
    PRIMARY KEY (id)
  );`;

    db.query(sql);

    console.log('Created "old_shopping_list" table');
  } catch (error) {
    console.error('Error migrating old_shopping_list:', error);
    throw error;
  }
}

async function migrateOldShoppingListRows(db)
{
  try {
    const sql = `CREATE TABLE IF NOT EXISTS old_shopping_list_rows (
    id INT NOT NULL AUTO_INCREMENT, listId INT NOT NULL, productId INT NOT NULL,
    rowIndex INT NOT NULL, quantity TINYINT UNSIGNED NOT NULL, isChecked TINYINT(1) NOT NULL,
    PRIMARY KEY (id), INDEX prod_ind (productId), INDEX list_ind (listId), INDEX row_ind(rowIndex),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (listId) REFERENCES shopping_list(id) ON DELETE RESTRICT
  );`;

    db.query(sql);

    console.log('Created "old_shopping_list_rows" table');
  } catch (error) {
    console.error('Error migrating old_shopping_list_rows:', error);
    throw error;
  }
}

async function main()
{
  const optionsDb = {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    //database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: true
  };
  const connection = mysql.createConnection(optionsDb);

  if (connection && process.env.MYSQL_DATABASE) {
    await createDatabase(connection, process.env.MYSQL_DATABASE);
    await migrateCategories(connection);
    await migrateProducts(connection);
    await migrateShoppingList(connection);
    await migrateShoppingListRows(connection);
    await migrateOldShoppingList(connection);
    await migrateOldShoppingListRows(connection);

    console.log("Migration completed.");
  }
  if (connection) {
    connection.end();
  }
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to migrate the database:',
    err,
  );
});