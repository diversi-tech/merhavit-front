// import { State, Action, StateContext, Selector } from '@ngxs/store';
// import { Injectable } from '@angular/core';
// import { FileItem } from ''; // נתיב לקובץ המודל

// // Actions
// export class SetFiles {
//   static readonly type = '[Files] Set Files';
//   constructor(public files: FileItem[]) {}
// }

// // State Model
// export interface FileStateModel {
//   files: FileItem[];
// }

// // State
// @State<FileStateModel>({
//   name: 'files',
//   defaults: {
//     files: [],
//   },
// })
// @Injectable()
// export class FileState {
//   @Selector()
//   static files(state: FileStateModel): FileItem[] {
//     return state.files;
//   }

//   @Action(SetFiles)
//   setFiles(ctx: StateContext<FileStateModel>, action: SetFiles) {
//     const state = ctx.getState();
//     ctx.setState({
//       ...state,
//       files: action.files,
//     });
//   }
// }
