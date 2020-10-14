import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../todo-list/models/todo';
import { Title } from '../todo-list/models/title';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  public todoList: Todo[];
  public todo = '';
  public changedTodo = '';
  public titleList: Title[];
  public title = '';
  public newTitle = '';
  public titleId: number;
  public editTitleState = false;
  public editTodoState = false;
  public editableTodoId: number;

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.todoList, event.previousIndex, event.currentIndex);
    console.log(event.previousIndex, event.currentIndex);
  }

  private httpClient: HttpClient;
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  onEditTitle() {
    this.editTitleState = !this.editTitleState;
  }

  cancelEditTitle(){
    this.editTitleState = false;
  }

  onUpdateTitle(newTitle): void {
    if(this.titleList.length === 0) {
      this.httpClient.post<Title>(
        'https://nestjs-todo-app.herokuapp.com/rest/title',
        {
         title: newTitle
        }
      ).subscribe(newTitle => {
          this.title = newTitle.title;
          this.titleId = newTitle.id;
          this.titleList.push(newTitle);
        })
        this.onEditTitle();
    } else {
      this.httpClient.patch<Title>(
        'https://nestjs-todo-app.herokuapp.com/rest/title/' + this.titleId,
        {
         title: newTitle
        }
      ).subscribe(title => {
          this.title = title.title;
          this.onEditTitle();
        })
    }
  }

  onDeleteTitle(): void {
    if(this.titleList.length !== 0)
    this.httpClient.delete<void>(
      'https://nestjs-todo-app.herokuapp.com/rest/title/' + this.titleId
    ).subscribe(() => {
        this.titleList = [];
        this.title = '';
      });
  }

  onEditTodo(todoId: number) {
    this.editTodoState = !this.editTodoState;
    this.editableTodoId = todoId;
  }

  offEditTodo() {
    this.editTodoState = !this.editTodoState;
    this.editableTodoId = null;
  }

  onUpdateTodo(todoId, todoIndex): void {
    if(this.changedTodo) {
      this.httpClient.patch<Todo>(
        'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoId,
        {
         todo: this.changedTodo
        }
      ).subscribe(todo => {
          this.changedTodo = todo.todo;
          this.todoList[todoIndex].todo = this.changedTodo;
          this.changedTodo = '';
          this.offEditTodo();
        })
    }
  }

  onCreateTodo(): void {
    if(this.todo) {
      this.httpClient.post<Todo>(
        'https://nestjs-todo-app.herokuapp.com/rest/todo/',
        {
         todo: this.todo
        }
      ).subscribe(todo => {
          this.todoList.push(todo);
        });
        this.todo = '';
    }
  }

  onRemoveTodo(todoOnDelete: Todo) {
    this.httpClient.delete<void>(
      'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoOnDelete.id
    ).subscribe(() => {
        this.todoList = this.todoList.filter(todo => todo.id !== todoOnDelete.id);
      });
  }

  onComplete(todoOnComplete: Todo) {
    this.httpClient.patch<Todo>(
      'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoOnComplete.id,
      {
        todo: todoOnComplete.todo,
        isCompleted: !todoOnComplete.isCompleted
      }
    ).subscribe((updatedTodo: Todo) => {
        this.todoList = this.todoList.map(todo => todo.id !== updatedTodo.id ? todo : updatedTodo);
      });
  }

  ngOnInit(): void {
    this.httpClient.get<Todo[]>('https://nestjs-todo-app.herokuapp.com/rest/todo/')
    .subscribe( todoList => {
      this.todoList = todoList;
      console.log(this.todoList);
    });
    this.httpClient.get<Title[]>('https://nestjs-todo-app.herokuapp.com/rest/title/')
    .subscribe( title => {
      this.titleList = title;
      title.forEach(id => {this.titleId = id.id});
      title.forEach(title => {this.title = title.title});
      console.log(this.titleList);
    });
  }
}
