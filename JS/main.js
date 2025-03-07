// Selectors

const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');

// mongo API url
const mongoAPIUrl = "https://node-api-list.vercel.app/api/todo";

// Event Listeners

toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
// document.addEventListener("DOMContentLoaded", getTodos); // get local data
document.addEventListener("DOMContentLoaded", getMongoTodos); // get from mongo db
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));

// Check if one theme has been set previously and apply it (or std theme if not found):
let savedTheme = localStorage.getItem('savedTheme');
savedTheme === null ?
    changeTheme('standard')
    : changeTheme(localStorage.getItem('savedTheme'));

// Functions;
function addToDo(event) {
    // Prevents form from submitting / Prevents form from relaoding;
    event.preventDefault();

    // toDo DIV;
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo', `${savedTheme}-todo`);

    // Create LI
    const newToDo = document.createElement('li');
    if (toDoInput.value === '') {
            alert("You must write something!");
        } 
    else {
        // newToDo.innerText = "hey";
        newToDo.innerText = toDoInput.value+' @'+new Date().toLocaleString();
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        // Adding to local storage;
        // savelocal(toDoInput.value);

        //Adding to mongo db
        saveToMongo(toDoInput.value);

        // check btn;
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add('check-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(checked);
        // delete btn;
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add('delete-btn', `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        // Append to list;
        toDoList.appendChild(toDoDiv);

        // CLearing the input;
        toDoInput.value = '';
    }

}   


function deletecheck(event){

    // console.log(event.target);
    const item = event.target;

    // delete
    if(item.classList[0] === 'delete-btn')
    {
        // item.parentElement.remove();
        // animation
        item.parentElement.classList.add("fall");
        removeTodosFromDB(item.value);
        //removing local todos;
        removeLocalTodos(item.parentElement);

        item.parentElement.addEventListener('transitionend', function(){
            item.parentElement.remove();
        })
    }

    // check
    if(item.classList[0] === 'check-btn')
    {
        updateTodoItem(item.value, item.parentElement.classList.value.includes('completed') ? false : true);
        item.parentElement.classList.toggle("completed");
    }


}

function removeTodosFromDB(id)
{
    fetch(mongoAPIUrl+'/'+id, { method: 'DELETE'})
        .then(response => {
            if(!response.ok) {
                throw new Error('Error from API end.')
            }
        })
}

function updateTodoItem(_id, item_done)
{
    const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id, item_done}),
      };
    fetch(mongoAPIUrl+'/'+_id, requestOptions)
        .then(response => {
            if(!response.ok) {
                throw new Error('Error from API end.')
            }
        })
}


// Saving to local storage:
function savelocal(todo){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function saveToMongo(todo)
{
    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({desc: todo, date: new Date()}),
      };
    fetch(mongoAPIUrl, requestOptions)
        .then(response => {
            if(!response.ok) {
                throw new Error('Error from API end.')
            }
        })
    // getMongoTodos(); 
}


function getTodos() {
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.forEach(function(todo) {
        // toDo DIV;
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add("todo", `${savedTheme}-todo`);

        // Create LI
        const newToDo = document.createElement('li');
        
        newToDo.innerText = todo;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        // check btn;
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check"></i>';
        checked.classList.add("check-btn", `${savedTheme}-button`);
        toDoDiv.appendChild(checked);
        // delete btn;
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash"></i>';
        deleted.classList.add("delete-btn", `${savedTheme}-button`);
        toDoDiv.appendChild(deleted);

        // Append to list;
        toDoList.appendChild(toDoDiv);
    });
}

function getMongoTodos()
{
    fetch(mongoAPIUrl, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }})
    .then(response => {
        console.log('response => ', response);
        if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Data not found');
            } else if (response.status === 500) {
              throw new Error('Server error');
            } else {
              throw new Error('Network response was not ok');
            }
        }
        console.log('API issue');
        return response.json();
    })
    .then((todos) => {
        console.log('todos => ', todos);
        if(todos.list.length > 0) {
            todos.list.forEach(function(todo) {
                console.log('todo ==> ', todo);
                // toDo DIV;
                const toDoDiv = document.createElement("div");
                let completedItem = todo?.item_done ? 'completed' : '-';
                toDoDiv.classList.add("todo", `${savedTheme}-todo`, completedItem);
        
                // Create LI
                const newToDo = document.createElement('li');
                
                newToDo.innerText = todo.desc+ ' @'+new Date(todo.date).toLocaleString();
                newToDo.classList.add('todo-item');
                toDoDiv.appendChild(newToDo);
        
                // check btn;
                const checked = document.createElement('button');
                checked.innerHTML = '<i class="fas fa-check"></i>';
                checked.classList.add("check-btn", `${savedTheme}-button`);
                checked.value = todo._id;
                toDoDiv.appendChild(checked);
                // delete btn;
                const deleted = document.createElement('button');
                deleted.innerHTML = '<i class="fas fa-trash"></i>';
                deleted.classList.add("delete-btn", `${savedTheme}-button`);
                deleted.value = todo._id;
                toDoDiv.appendChild(deleted);
        
                // Append to list;
                toDoList.appendChild(toDoDiv);
            });
        }
    })
    .catch(error => {
        console.log('Error:', error);
    });
}


function removeLocalTodos(todo){
    //Check: if item/s are there;
    let todos;
    if(localStorage.getItem('todos') === null) {
        todos = [];
    }
    else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    const todoIndex =  todos.indexOf(todo.children[0].innerText);
    // console.log(todoIndex);
    todos.splice(todoIndex, 1);
    // console.log(todos);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Change theme function:
function changeTheme(color) {
    localStorage.setItem('savedTheme', color);
    savedTheme = localStorage.getItem('savedTheme');

    document.body.className = color;
    // Change blinking cursor for darker theme:
    color === 'darker' ? 
        document.getElementById('title').classList.add('darker-title')
        : document.getElementById('title').classList.remove('darker-title');

    document.querySelector('input').className = `${color}-input`;
    // Change todo color without changing their status (completed or not):
    document.querySelectorAll('.todo').forEach(todo => {
        Array.from(todo.classList).some(item => item === 'completed') ? 
            todo.className = `todo ${color}-todo completed`
            : todo.className = `todo ${color}-todo`;
    });
    // Change buttons color according to their type (todo, check or delete):
    document.querySelectorAll('button').forEach(button => {
        Array.from(button.classList).some(item => {
            if (item === 'check-btn') {
              button.className = `check-btn ${color}-button`;  
            } else if (item === 'delete-btn') {
                button.className = `delete-btn ${color}-button`; 
            } else if (item === 'todo-btn') {
                button.className = `todo-btn ${color}-button`;
            }
        });
    });
}
