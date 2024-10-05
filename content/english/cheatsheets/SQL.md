---
title: SQL
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/sql.svg"
description: is a domain-specific language for managing and manipulating relational databases.

---

#### 1. SELECT
   {{< accordion "SELECT: Retrieve data from one or more tables" >}}
   The fundamental command to query and retrieve data from a database.
   <br>
   ```sql
   SELECT column1, column2 FROM table_name WHERE condition;
   ```
   {{< /accordion >}}

#### 2. INSERT
   {{< accordion "INSERT: Add new records to a table" >}}
   Insert one or more new rows into a specified table.
   <br>
   ```sql
   INSERT INTO table_name (column1, column2) VALUES (value1, value2);
   ```
   {{< /accordion >}}

#### 3. UPDATE
   {{< accordion "UPDATE: Modify existing records in a table" >}}
   Update the values of existing records in a specified table.
   <br>
   ```sql
   UPDATE table_name SET column1 = value1 WHERE condition;
   ```
   {{< /accordion >}}

#### 4. DELETE
   {{< accordion "DELETE: Remove records from a table" >}}
   Delete one or more rows from a table based on a specified condition.
   <br>
   ```sql
   DELETE FROM table_name WHERE condition;
   ```
   {{< /accordion >}}

#### 5. CREATE TABLE
   {{< accordion "CREATE TABLE: Define a new table" >}}
   Create a new table with specified columns, data types, and constraints.
   <br>
   ```sql
   CREATE TABLE table_name (
     column1 datatype,
     column2 datatype,
     ...
   );
   ```
   {{< /accordion >}}

#### 6. ALTER TABLE
   {{< accordion "ALTER TABLE: Modify an existing table" >}}
   Add, modify, or delete columns in an existing table.
   <br>
   ```sql
   ALTER TABLE table_name
   ADD column_name datatype;
   ```
   {{< /accordion >}}

#### 7. DROP TABLE
   {{< accordion "DROP TABLE: Delete an existing table" >}}
   Permanently remove a table and its data from the database.
   <br>
   ```sql
   DROP TABLE table_name;
   ```
   {{< /accordion >}}

#### 8. CREATE INDEX
   {{< accordion "CREATE INDEX: Create an index on a table" >}}
   Improve the speed of data retrieval by creating an index on one or more columns.
   <br>
   ```sql
   CREATE INDEX index_name ON table_name (column1, column2, ...);
   ```
   {{< /accordion >}}

#### 9. SELECT DISTINCT
   {{< accordion "SELECT DISTINCT: Retrieve unique values" >}}
   Retrieve only unique values from a specified column or set of columns.
   <br>
   ```sql
   SELECT DISTINCT column1 FROM table_name;
   ```
   {{< /accordion >}}

#### 10. WHERE
   {{< accordion "WHERE: Filter records based on a condition" >}}
   Specify conditions to filter records in a SELECT, UPDATE, or DELETE statement.
   <br>
   ```sql
   SELECT * FROM table_name WHERE condition;
   ```
   {{< /accordion >}}

#### 11. GROUP BY
   {{< accordion "GROUP BY: Group rows that have the same values in specified columns" >}}
   Group rows based on common values in one or more columns.
   <br>
   ```sql
   SELECT column1, COUNT(*) FROM table_name GROUP BY column1;
   ```
   {{< /accordion >}}

#### 12. HAVING
   {{< accordion "HAVING: Filter results of GROUP BY based on a condition" >}}
   Apply a condition to filter the results of a GROUP BY clause.
   <br>
   ```sql
   SELECT column1, COUNT(*) FROM table_name GROUP BY column1 HAVING COUNT(*) > 1;
   ```
   {{< /accordion >}}

#### 13. ORDER BY
   {{< accordion "ORDER BY: Sort the result set of a query" >}}
   Arrange the output of a SELECT statement in ascending or descending order.
   <br>
   ```sql
   SELECT * FROM table_name ORDER BY column1 ASC;
   ```
   {{< /accordion >}}

#### 14. JOIN
   {{< accordion "JOIN: Combine rows from two or more tables based on a related column" >}}
   Merge data from multiple tables based on a specified condition.
   <br>
   ```sql
   SELECT * FROM table1 JOIN table2 ON table1.column_name = table2.column_name;
   ```
   {{< /accordion >}}

#### 15. COUNT
   {{< accordion "COUNT: Count the number of rows in a table" >}}
   Calculate the number of rows that satisfy a given condition.
   <br>
   ```sql
   SELECT COUNT(*) FROM table_name WHERE condition;
   ```
   {{< /accordion >}}
