const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () =>
      console.log("Server is Running at http://localhost:3004/")
    );
  } catch (error) {
    console.log(`Db Error :${error.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

const hasPriorityandStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityandStatusProperty(request.query):
      getTodoQuery = `
SELECT
*
FROM todo
WHERE 
todo LIKE '%${search_q}%'
AND status='${status}'
AND priority='${priority}';`;
      break;

    case hasStatusProperty(request.query):
      getTodoQuery = `
SELECT
*
FROM todo
WHERE
todo LIKE '%${search_q}%'
AND status='${status}';`;
      break;

    case hasPriorityProperty(request.query):
      getTodoQuery = `
    SELCT
    *
    FROM todo
    WHERE
    todo like '%${search_q}%'
    AND priority='${priority}';`;
      break;

    default:
      getTodoQuery = `
    SELECT 
    *
    FROM todo
    WHERE 
    todo LIKE '%${search_q}%';`;
  }

  const data = await database.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT
    *
    FROM todo
    WHERE
    todo.id='${todoId}';`;
  const result = await database.get(getTodo);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO
    todo(id,todo,priority,status)
    VALUES (${id},
    '${todo}',
    '${priority}',
    '${status}');`;
  const result_2 = await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  const updatedColumn = "";

  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
  }

  const previousTodoQuery = `
SELECT
*
FROM
todo
WHERE
id=${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
    todo
    SET
    todo='${todo}',
    priority='${priority}',
    status='${status}'
    WHERE
     id=${todoId}`;
  await database.run(updateTodoQuery);
  response.send(`${updatedColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE
    id=${todoId}`;
  const result_4 = await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
