import {Component, EventEmitter, OnInit, Output} from '@angular/core';
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
  @Output() listState = new EventEmitter<boolean>();

  public todoList: Todo[];
  public todo = '';
  public todoPosition: number;
  public todoPrevPos: number;
  public todoNextPos: number;

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
    this.todoPrevPos = event.previousIndex;
    this.todoNextPos = event.currentIndex;
    let todoPrevId = this.todoList[this.todoPrevPos].id;
    let todoNextId = this.todoList[this.todoNextPos].id;

    this.httpClient.patch<Todo>(
      'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoPrevId,
      {
       todo: this.todoList[this.todoPrevPos].todo,
       position: this.todoPrevPos
      }
    ).subscribe();

    this.httpClient.patch<Todo>(
      'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoNextId,
      {
        todo: this.todoList[this.todoNextPos].todo,
        position: this.todoNextPos
      }
    ).subscribe();
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

  onDeleteList(): void {
    if(this.titleList.length > 0) {
      this.httpClient.delete<void>(
        'https://nestjs-todo-app.herokuapp.com/rest/title/' + this.titleId
      ).subscribe();
    } 
  
    if(this.todoList.length > 0) {
      this.todoList.forEach(item => {
        this.httpClient.delete<void>(
          'https://nestjs-todo-app.herokuapp.com/rest/todo/' + item.id
        ).subscribe();
      })
    } 
    this.listState.emit(true);
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
           todo: this.todo,
           position: this.todoPosition
          }
        ).subscribe(todo => {
            this.todoList.push(todo);
            this.todoPosition++;
          });
          this.todo = '';
          for (let i = 0; i < this.todoList.length; i++) {
            this.httpClient.patch<void>(
              'https://nestjs-todo-app.herokuapp.com/rest/todo/' + this.todoList[i].id,
              {
                todo: this.todoList[i].todo,
                position: this.todoList[i].position
              }
            ).subscribe();
          }
    }
  }

  onRemoveTodo(todoOnDelete: Todo) {
    this.httpClient.delete<void>(
      'https://nestjs-todo-app.herokuapp.com/rest/todo/' + todoOnDelete.id
    ).subscribe(() => {
        this.todoList = this.todoList.filter(todo => todo.id !== todoOnDelete.id);
        this.todoList = this.todoList.map(item => {
         return {
           ...item,
           position: this.todoList.indexOf(item)
         }
        });
        this.todoPosition = this.todoPosition - 1;
        for (let i = 0; i < this.todoList.length; i++) {
          this.httpClient.patch<void>(
            'https://nestjs-todo-app.herokuapp.com/rest/todo/' + this.todoList[i].id,
            {
              todo: this.todoList[i].todo,
              position: this.todoList[i].position
            }
          ).subscribe();
        }
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
    //GET title
    this.httpClient.get<Title[]>('https://nestjs-todo-app.herokuapp.com/rest/title/')
    .subscribe( title => {
      this.titleList = title;
      title.forEach(id => {this.titleId = id.id});
      title.forEach(title => {this.title = title.title});
    });

    //GET todo
    this.httpClient.get<Todo[]>('https://nestjs-todo-app.herokuapp.com/rest/todo/')
    .subscribe( todoList => {
     this.todoList = todoList;
     this.todoList.sort((a,b)=> (a.position < b.position) ? -1: ((b.position > a.position) ? 1 : 0)); 
     if(this.todoList.length !== 0) {
      this.todoPosition = this.todoList.length;
     } else {
      this.todoPosition = 0;
     }
    });
  }
}
