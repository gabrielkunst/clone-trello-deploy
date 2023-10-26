// GABRIEL
// FUNÇÃO QUE DEFINE AS VARIÁVEIS E FUNÇÃO PARA SALVAR OS DADOS NO LOCALSTORAGE
const Store = {
	backgroundColor: null,
	columns: null,

	init() {
		const columns = getFromLocalStorage("columns", []);
		const backgroundColor = getFromLocalStorage(
			"backgroundColor",
			"#2b2b2b"
		);

		this.backgroundColor = backgroundColor;
		this.columns = columns;
	},

	saveColumns(columns) {
		this.columns = columns;
		updateLocalStorage("columns", columns);
		window.dispatchEvent(new CustomEvent("columnsUpdate"));
	},

	saveBackgroundColor(backgroundColor) {
		this.backgroundColor = backgroundColor;
		updateLocalStorage("backgroundColor", backgroundColor);
		window.dispatchEvent(new CustomEvent("backgroundColorUpdate"));
	},
};

// LILIAN
// FUNÇÃO QUE BUSCA OS DADOS NO LOCALSTORAGE
function getFromLocalStorage(localStorageKey, defaultValue) {
	try {
		console.log(`Fetching ${localStorageKey} from localStorage`);
		const dataFromLocalStorage = localStorage.getItem(localStorageKey);
		console.log(
			"The data returned from localStorage is ",
			dataFromLocalStorage
		);
		if (dataFromLocalStorage) {
			const dataAsJson = JSON.parse(dataFromLocalStorage);
			return dataAsJson;
		}
		return defaultValue;
	} catch (error) {
		console.log(
			`Error while fetching ${localStorageKey} from localStorage, setting null instead`
		);
		console.error(error);
		return defaultValue;
	}
}

// LILIAN
// FUNÇÃO QUE SALVA OS DADOS NO LOCALSTORAGE
function updateLocalStorage(localStorageKey, data) {
	try {
		console.log(`Setting ${localStorageKey} key as `, data);
		const dataAsJson = JSON.stringify(data);
		localStorage.setItem(localStorageKey, dataAsJson);
	} catch (error) {
		console.error(error);
		alert(`Erro ao salvar ${localStorageKey} no localStorage`);
	}
}

// JULIANO
// FUNÇÃO QUE RENDERIZA A COR DE FUNDO
function renderBackgroundColor() {
	const colorPickerInput = document.querySelector("#colorPickerInput");
	const backgroundColor = Store.backgroundColor;
	colorPickerInput.value = backgroundColor;
	document.body.style.backgroundColor = backgroundColor;
}

// JULIANO
// FUNÇÃO QUE SALVA A COR DE FUNDO
function handleColorInputValueChange(event) {
	const inputColorValue = event.target.value;
	console.log("The color picked is ", inputColorValue);
	Store.saveBackgroundColor(inputColorValue);
}

// GABRIEL
// FUNÇÃO QUE MOSTRA O FORMULÁRIO PARA CRIAR UMA NOVA COLUNA
function handleCreateColumnToggle() {
	const createColumnForm = document.querySelector(".create-column");
	const createColumnButton = document.querySelector(".create-column-button");
	createColumnForm.classList.toggle("hidden");
	createColumnButton.classList.toggle("hidden");
}

// GABRIEL
// FUNÇÃO QUE CRIA UMA NOVA COLUNA
function handleAddColumnButtonClick() {
	console.log("Add column button was clicked");
	const createColumnInput = document.querySelector(".create-column__input");
	const inputColumnValue = createColumnInput.value.trim();

	if (inputColumnValue === "") {
		alert("Forneça um nome para a coluna");
		return;
	}

	console.log("The column name is", inputColumnValue);

	const newColumn = {
		id: Date.now(),
		title: inputColumnValue,
		tasks: [],
	};
	console.log("The new column is", newColumn);

	const allColumns = [...Store.columns, newColumn];
	createColumnInput.value = "";
	Store.saveColumns(allColumns);
	handleCreateColumnToggle();
}

// GABRIEL
// FUNÇÃO QUE CANCELA A CRIAÇÃO DE UMA NOVA COLUNA
function handleCancelColumnButtonClick() {
	const createColumnInput = document.querySelector(".create-column__input");
	console.log("Column creation was canceled");
	handleCreateColumnToggle();
	createColumnInput.value = "";
}

// GABRIEL
// FUNÇÃO QUE RENDERIZA AS COLUNAS
function renderColumns() {
	const columnsContainer = document.querySelector(".columns");
	columnsContainer.innerHTML = "";

	const columns = Store.columns;
	if (columns.length === 0) {
		handleCreateColumnToggle();
	}

	if (columns && columns.length > 0) {
		const columnsHTML = columns.map(getColumnHTML).join("");
		columnsContainer.innerHTML = columnsHTML;
	}
}

// GABRIEL
// FUNÇÃO QUE GERA O HTML DE UMA COLUNA
function getColumnHTML(column) {
	return `
		<div class="column" id="column-${
			column.id
		}" dropzone="copy" ondrop="handleTaskDropByDrag(event)" ondragover="allowTaskDrop(event)">
			<div class="column__header">
				<span class="column__title">${column.title}</span>	
				<div class="column__options">
					<button onclick="editColumnTitleById(${column.id})">
						<i class="fa-solid fa-pencil"></i>
					</button>
					<button onclick="deleteColumnById(${column.id})">
						<i class="fa-regular fa-trash-can"></i>
					</button>
				</div>
			</div>
			<section class="column__tasks" id="tasks-${column.id}">${column.tasks
		.map((task) => getColumnTaskHTML(task, column.id))
		.join("")}</section>
			<button class="column__create-button"
			id="create-task-button-${column.id}" onclick="handleCreateTaskButtonClick(${
		column.id
	})" >
				<i class="fa-solid fa-plus"></i>
				<span>Adicionar tarefa</span>
			</button>
		</div>
	`;
}

// JULIANO
// FUNÇÃO QUE DELETA UMA COLUNA
function deleteColumnById(columnId) {
	if (!confirm("Tem certeza que deseja excluir a coluna?")) {
		return;
	}

	console.log("Deleting column with id", columnId);
	const columns = Store.columns;
	const columnsWithoutDeleted = columns.filter(
		(column) => column.id !== columnId
	);
	Store.saveColumns(columnsWithoutDeleted);
}

// JULIANO
// FUNÇÃO QUE EDITA O TÍTULO DE UMA COLUNA
function editColumnTitleById(columnId) {
	console.log("Editing column with id", columnId);
	const newColumnTitle = prompt("Digite o novo nome da coluna").trim();
	console.log("The new column title is", newColumnTitle);

	if (!newColumnTitle) {
		alert("Forneça um nome para a coluna");
		return;
	}

	const allColumns = Store.columns;
	const columnToEdit = allColumns.find((column) => column.id === columnId);

	if (!columnToEdit) {
		alert("Coluna não encontrada");
		return;
	}

	columnToEdit.title = newColumnTitle;
	Store.saveColumns(allColumns);
}

// EDUARDO
// FUNÇÃO RESPONSÁVEL RECEBER O EVENTO DE DROP E REALIZAR A MOVIMENTAÇÃO DA TAREFA
function handleTaskDropByDrag(event) {
	event.preventDefault();
	console.log("Task was dropped");

	const columnId = Number(getColumnTasksContainer(event));

	try {
		const task = event.dataTransfer.getData("application/json");
		const { fromColumn, id, content } = JSON.parse(task);
		const taskToBeAdded = {
			id: Number(id),
			content,
		};

		if (columnId === fromColumn) {
			console.log(
				"User tried to move task to the same column where the task is"
			);
			return;
		}

		const tasksContainer = document.querySelector(`#tasks-${columnId}`);
		const allColumns = Store.columns;
		const columnToAddTask = allColumns.find(
			(column) => column.id === columnId
		);
		const columnToDeleteTask = allColumns.find(
			(column) => column.id === fromColumn
		);

		columnToAddTask.tasks = [...columnToAddTask.tasks, taskToBeAdded];
		columnToDeleteTask.tasks = columnToDeleteTask.tasks.filter(
			(task) => task.id !== taskToBeAdded.id
		);

		const taskHTML = getColumnTaskHTML(taskToBeAdded, columnId);
		tasksContainer.innerHTML += taskHTML;
		console.log("New columns are ", allColumns);
		Store.saveColumns(allColumns);
	} catch (error) {
		alert("Erro ao mover tarefa");
		console.error(error);
	}
}

// EDUARDO
// FUNÇÃO RESPONSÁVEL POR PERMITIR O DROP DA TAREFA
function allowTaskDrop(event) {
	event.preventDefault();
}

// EDUARDO
// FUNÇÃO RESPONSÁVEL POR PEGAR OS DADOS DA TAREFA E TRANSFORMAR EM JSON
function handleTaskDrag(event, columnId) {
	const taskTitleElement = event.target.querySelector(".task__title");
	if (!taskTitleElement) {
		console.error("No task content found");
		return;
	}

	const task = {
		fromColumn: columnId,
		id: event.target.id,
		content: taskTitleElement.textContent,
	};

	const taskAsJson = JSON.stringify(task);
	event.dataTransfer.setData("application/json", taskAsJson);
}

// EDUARDO
// FUNÇÃO RESPONSÁVEL POR PEGAR O ID DA COLUNA QUE A TAREFA ESTÁ
function getColumnTasksContainer(event) {
	let target = event.target;
	let parentNode = event.target.parentNode;

	if (target.id.includes("column")) {
		const columnId = target.id.split("-")[1];
		return columnId;
	}

	while (!parentNode.id.includes("column")) {
		parentNode = parentNode.parentNode;
	}

	const columnId = parentNode.id.split("-")[1];
	return columnId;
}

// NICOLAS
// FUNÇÃO QUE GERA O HTML DO FORMULÁRIO DE CRIAÇÃO DE TAREFA
function getCreateTaskFormHTML(columnId) {
	return `
	<div class="create-task-form" id="create-task-form-${columnId}">
		<input
			id="create-task-form-input"
			placeholder="Conteúdo da tarefa..."
			class="create-task-form__input"
		/>
		<div class="create-task-form__buttons">
			<button class="create-task-form__add" onclick="createTask(${columnId})">Adicionar tarefa</button>
			<button class="create-task-form__cancel" onclick="handleCancelTaskButtonClick(${columnId})">
				<i class="fa-solid fa-xmark"></i>
			</button>
		</div>
	</div>
	`;
}

// NICOLAS
// FUNÇÃO QUE MOSTRA O FORMULÁRIO DE CRIAÇÃO DE TAREFA
function handleCreateTaskButtonClick(columnId) {
	console.log("Create task button was clicked");
	console.log(columnId);
	const columnContainer = document.querySelector(`#column-${columnId}`);
	console.log(columnContainer);
	const createTaskButton = document.querySelector(
		`#create-task-button-${columnId}`
	);
	createTaskButton.classList.toggle("hidden");
	const createTaskFormHTML = getCreateTaskFormHTML(columnId);

	columnContainer.innerHTML += createTaskFormHTML;
}

// NICOLAS
// FUNÇÃO QUE CANCELA A CRIAÇÃO DE UMA TAREFA
function handleCancelTaskButtonClick(columnId) {
	const createTaskForm = document.querySelector(".create-task-form");
	const createTaskButton = document.querySelector(
		`#create-task-button-${columnId}`
	);
	console.log("Task creation was canceled");
	createTaskForm.remove();
	createTaskButton.classList.toggle("hidden");
}

// NICOLAS
// FUNÇÃO QUE GERA O HTML DE UMA TAREFA
function getColumnTaskHTML(task, columnId) {
	console.log("the task received is ", task);
	return `
		<article class="task" id="${task.id}" draggable="true" ondragstart="handleTaskDrag(event, ${columnId})">
			<span class="task__title">${task.content}</span>
			<div class="task__options">
				<button onclick="editTaskContentById(${task.id},${columnId})">
					<i class="fa-solid fa-pencil"></i>
				</button>
				<button onclick="deleteTaskById(${task.id},${columnId})">
					<i class="fa-regular fa-trash-can"></i>
				</button>
			</div>
		</article>
	`;
}

// NICOLAS
// FUNÇÃO QUE CRIA UMA NOVA TAREFA
function createTask(columnId) {
	console.log("create task ", columnId);
	const createTaskInput = document.querySelector(".create-task-form__input");
	const taskContent = createTaskInput.value.trim();

	if (!taskContent) {
		alert("Forneça um nome para a tarefa");
		return;
	}

	const newTask = {
		id: Date.now(),
		content: String(taskContent),
	};

	console.log(columnId);

	const allColumns = Store.columns;
	const columnToAddTask = allColumns.find((column) => column.id === columnId);

	if (!columnToAddTask) {
		alert("Coluna não encontrada");
		return;
	}

	columnToAddTask.tasks.push(newTask);
	Store.saveColumns(allColumns);
}

// LILIAN
// FUNÇÃO QUE EDITA O CONTEÚDO DE UMA TAREFA
function editTaskContentById(taskId, columnId) {
	const allColumns = Store.columns;
	const columnToEditTask = allColumns.find((column) => {
		console.log(column);
		return column.id === columnId;
	});

	if (!columnToEditTask) {
		alert("Coluna não encontrada");
		return;
	}

	const taskToEdit = columnToEditTask.tasks.find(
		(task) => task.id === taskId
	);

	if (!taskToEdit) {
		alert("Tarefa não encontrada");
		return;
	}

	const newTaskContent = prompt("Digite o novo nome da tarefa").trim();
	console.log("The new task content is", newTaskContent);

	if (!newTaskContent) {
		alert("Forneça um nome para a tarefa");
		return;
	}

	taskToEdit.content = newTaskContent;
	Store.saveColumns(allColumns);
}

// LILIAN
// FUNÇÃO QUE DELETA UMA TAREFA
function deleteTaskById(taskId, columnId) {
	if (!confirm("Tem certeza que deseja excluir a tarefa?")) {
		return;
	}

	const allColumns = Store.columns;
	const columnToEditTask = allColumns.find(
		(column) => column.id === columnId
	);

	console.log(columnId);

	if (!columnToEditTask) {
		alert("Coluna não encontrada");
		return;
	}

	const tasksWithoutDeleted = columnToEditTask.tasks.filter(
		(task) => task.id !== taskId
	);

	columnToEditTask.tasks = tasksWithoutDeleted;
	Store.saveColumns(allColumns);
}

// GABRIEL
// FUNÇÃO QUE INICIA O APP
window.addEventListener("DOMContentLoaded", () => {
	Store.init();
	renderColumns();
	renderBackgroundColor();

	const colorPickerInput = document.querySelector("#colorPickerInput");
	const createColumnButton = document.querySelector(".create-column-button");
	const addColumnButton = document.querySelector(".create-column__add");
	const cancelColumnButton = document.querySelector(".create-column__cancel");

	createColumnButton.addEventListener("click", handleCreateColumnToggle);
	addColumnButton.addEventListener("click", handleAddColumnButtonClick);
	cancelColumnButton.addEventListener("click", handleCancelColumnButtonClick);
	colorPickerInput.addEventListener("change", handleColorInputValueChange);
	window.addEventListener("columnsUpdate", renderColumns);
	window.addEventListener("backgroundColorUpdate", renderBackgroundColor);
});
