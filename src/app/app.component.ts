import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../app/components/todo-list/models/todo';
import { Title} from '../app/components/todo-list/models/title';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title: boolean = false;
  public todo: boolean = false;

  public todoListButtonState: boolean = true;
  public todoListState: boolean = false;

  private httpClient: HttpClient;
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  addTodoList(state: any) {
    this.todoListState = state || false;
    this.todoListButtonState = state || false;
  }

  ngOnInit(): void {
     //GET title
     this.httpClient.get<Title[]>('https://nestjs-todo-app.herokuapp.com/rest/title/')
     .subscribe( title => {
      if(title.length > 0) {
        this.title = true;
      } else {
        this.title = false;
      }
     });

     //GET todo
    this.httpClient.get<Todo[]>('https://nestjs-todo-app.herokuapp.com/rest/todo/')
    .subscribe( todoList => {
      if(todoList.length > 0) {
        this.todo = true;
      } else {
        this.todo = false;
      }
    });
  }
}
