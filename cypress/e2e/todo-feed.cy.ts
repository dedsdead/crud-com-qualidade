const BASE_URL = 'http://localhost:3000';

describe('/ - Todos Feed', () => {
  it('When load, renders the page', () => {
    cy.visit(BASE_URL);
  });
  it('When create a new todo, it must be returned by the API', () => {
    //Mocar o backend
    cy.intercept(
      { method: 'POST', url: `${BASE_URL}/api/todos` },
      (request) => {
        request.reply({
          statusCode: 201,
          body: {
            todo: {
              id: '9e0cbfba-4cfc-4793-87ad-2dfc8f44331b',
              content: 'Test todo',
              date: '2023-07-23T22:16:01.044Z',
              done: false,
            },
          },
        });
      }
    ).as('createTodo');
    //2 - Abrir a página
    cy.visit(BASE_URL);
    //3 - Selecionar o input de criar todo
    //4 - Digitar no input
    cy.get("input[name='add-todo']").type('Test todo');
    //5 - Selecionar o botao de criar nova todo
    //6 - Clicar no botao
    cy.get("[aria-label='Adicionar novo item']").click();
    //7 - Checar se o novo elemento foi criado
    cy.wait('@createTodo').should(({ response }) => {
      expect(response && response.body.todo).to.have.property(
        'content',
        'Test todo'
      );
    });
  });
});
