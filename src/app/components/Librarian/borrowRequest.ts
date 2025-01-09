import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BorrowRequest {
  id: string;
  resourceName: string;
  studentName: string;
  status: string;
  requestDate: string;
  fromDate: string;
  toDate: string;
  approvedBy?: string;
}

@Component({
  selector: 'app-borrow-request-management',
  templateUrl: './borrowRequest.html',
  styleUrls: ['./borrowRequest.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BorrowRequestManagementComponent implements OnInit {
  borrowRequests: BorrowRequest[] = [];
  confirmBorrowRequest: BorrowRequest | null = null;
  actionType: 'Approved' | 'Rejected' | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getBorrowRequests();
  }

  getBorrowRequests(): void {
    this.apiService.Read('/borrowRequests/getAll').subscribe({
      next: (data: BorrowRequest[]) => {
        this.borrowRequests = data;
      },
      error: (err) => console.error('Error loading borrow requests:', err),
    });
  }

  openConfirmationDialog(
    borrowRequest: BorrowRequest,
    actionType: 'Approved' | 'Rejected'
  ): void {
    this.confirmBorrowRequest = borrowRequest;
    this.actionType = actionType;
  }

  closeConfirmation(): void {
    this.confirmBorrowRequest = null;
    this.actionType = null;
  }

  confirmAction(): void {
    if (!this.confirmBorrowRequest || !this.actionType) return;

    const librarianId = localStorage.getItem('idNumber');
    if (!librarianId) {
      alert('לא נמצא מזהה ספרנית.');
      this.closeConfirmation();
      return;
    }
    console.log(this.actionType);
    const data = {
      id: this.confirmBorrowRequest.id,
      librarianId,
      status: this.actionType,
    };
    this.apiService.Put('/borrowRequests/approve-or-reject', data).subscribe({
      next: (response: { success: boolean; data: BorrowRequest }) => {
        console.log(response);
        
        if (response.success && response.data) {
          // מחיקת הבקשה מהרשימה
          this.borrowRequests = this.borrowRequests.filter(
            (request) => request.id !== response.data.id
          );
        }
        this.closeConfirmation();
      },
      error: (err) => {
        console.error(
          `Error processing borrow request (${this.actionType}):`,
          err
        );
        this.closeConfirmation();
      },
    });
  }
  }

