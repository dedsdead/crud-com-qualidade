import { todoController } from '@ui/controller/todo';
import { GlobalStyles } from '@ui/theme/GlobalStyles';
import React from 'react';

const bg = 'https://mariosouto.com/cursos/crudcomqualidade/bg';
// const bg = "/imageName.jpeg"; load the image inside public folder

interface HomeTodo {
  id: string;
  content: string;
  done: boolean;
}

export default function Page() {
  const initialLoadCompleted = React.useRef(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pages, setPages] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [todos, setTodos] = React.useState<HomeTodo[]>([]);
  const [newTodoContent, setNewTodoContent] = React.useState<string>('');
  const [search, setSearch] = React.useState<string>('');
  const filteredTodos = todoController.filterTodosByContent<HomeTodo>(
    search,
    todos
  );

  const hasMorePages = pages > page;
  const hasTodos = filteredTodos.length !== 0;

  React.useEffect(() => {
    if (!initialLoadCompleted.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setTodos(todos);
          setPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadCompleted.current = true;
        });
    }
  }, []);
  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            todoController.create({
              content: newTodoContent,
              onError(customMessage) {
                alert(customMessage || 'Você precisa inserir um conteúdo');
              },
              onSuccess() {
                setPage(1);
                todoController.get({ page: 1 }).then(({ todos, pages }) => {
                  setTodos(todos);
                  setPages(pages);
                });
                setNewTodoContent('');
              },
            });
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Correr, Estudar..."
            value={newTodoContent}
            onChange={function (event) {
              setNewTodoContent(event.target.value);
            }}
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filtrar lista atual, ex: Dentista"
            onChange={function handleSearch(event) {
              const search = event.target.value.toLowerCase();
              setSearch(search);
            }}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredTodos.map((todo) => {
              return (
                <tr key={todo.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={function handleToggle() {
                        todoController.toggleDone({
                          id: todo.id,
                          updateTodosOnScreen() {
                            setTodos((currentTodos) => {
                              return currentTodos.map((currentTodo) => {
                                if (currentTodo.id === todo.id) {
                                  return {
                                    ...currentTodo,
                                    done: !currentTodo.done,
                                  };
                                }
                                return currentTodo;
                              });
                            });
                          },
                        });
                      }}
                    />
                  </td>
                  <td>{todo.id.substring(0, 4)}</td>
                  <td>
                    {!todo.done && todo.content}
                    {todo.done && <s>{todo.content}</s>}
                  </td>
                  <td align="right">
                    <button
                      data-type="delete"
                      onClick={() => {
                        todoController.deleteById(todo.id);
                        setPage(1);
                        todoController
                          .get({ page: 1 })
                          .then(({ todos, pages }) => {
                            setTodos(todos);
                            setPages(pages);
                          });
                      }}
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              );
            })}
            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: 'center' }}>
                  Carregando...
                </td>
              </tr>
            )}

            {!hasTodos && initialLoadCompleted && !isLoading && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: 'center' }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);
                      const nextPage = page + 1;
                      setPage(nextPage);
                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setTodos((oldTodos) => {
                            return [...oldTodos, ...todos];
                          });
                          setPages(pages);
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }}
                  >
                    Página {page}, Carregar mais{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '4px',
                        fontSize: '1.2em',
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
