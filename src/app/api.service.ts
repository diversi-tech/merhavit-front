import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { log } from 'node:console';
const serverPath = "http://localhost:3001"
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }
  // GET
  Read(query: string): Observable<any> {
    console.log("asdfghjkl;'");
    
    let fullpath = serverPath + query;

    const ans= this.http.get(fullpath, { withCredentials: true });
    console.log(ans);
    
    return ans
  }
  // POST
  Post(query: string, newData: any): Observable<any> {
    let fullpath = serverPath + query;
    console.log(fullpath);
    
    return this.http.post(fullpath, newData, { 
      headers: new HttpHeaders({'Content-Type': 'application/json'}), 
      withCredentials: true 
    });
  }
  // PUT
  Put(query: string, updatedData: any): Observable<any> {
    console.log("query", query)
    let fullpath = serverPath + query;
    return this.http.put(fullpath, updatedData, { 
      headers: new HttpHeaders({'Content-Type': 'application/json'}), 
      withCredentials: true 
    });
  }
  // DELETE
  Delete(query: string, data: any): Observable<any> {
    let fullpath = serverPath + query;
    return this.http.delete(fullpath, { 
      body: data, 
      headers: new HttpHeaders({'Content-Type': 'application/json'}), 
      withCredentials: true 
    });
  }
}
