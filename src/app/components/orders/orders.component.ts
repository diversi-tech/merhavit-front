import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './orders.component.html',
  styleUrls: ['../../show/show.component.css', './orders.component.css'],
})
export class OrdersComponent {
  activeTab = 'orders';
  userId: string = '';
  orders: any[] = [];
  public showNoDataMessage: boolean = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUserIdFromToken();
    await this.fetchOrders();
    // console.log('favorites', this.favorites);
  }

  getUserIdFromToken(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          this.userId = decodedToken.idNumber || '';
          console.log('userId', this.userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    } else {
      console.warn('Code is running on the server. Skipping token check.');
    }
  }

  async fetchOrders(): Promise<void> {
    if (this.userId) {
      return new Promise<void>((resolve, reject) => {
        this.showNoDataMessage = false;

        this.apiService.Read(`/users/idNumber/${this.userId}`).subscribe({
          next: (userData) => {
            const userId = userData?._id; // קבלת ה-ID של המשתמש
            console.log('userData', userData);

            if (userId) {
              this.apiService
                .Read(`/borrowRequests/student/${userId}`)
                .subscribe({
                  next: (borrowRequestsData) => {
                    console.log('borrowRequestsData', borrowRequestsData);

                    const borrowRequests = borrowRequestsData?.data; // המערך של ההשאלות
                    if (borrowRequests && borrowRequests.length > 0) {
                      borrowRequests.forEach((borrowRequest: any) => {
                        const resourceId = borrowRequest.resourceId;
                        const status = borrowRequest.status;
                        const requestDate = borrowRequest.requestDate;
                        console.log('resourceId', resourceId);
                        this.fetchResourceDetails(resourceId, status,requestDate);

                      });
                      console.log('orders', this.orders);
                    }
                   
                    
                    
                    else {
                      console.log('No borrow requests found for this user.');
                      this.showNoDataMessage = true;
                    }
                  },
                  error: (error) => {
                    console.error('Error fetching borrow requests:', error);
                    this.showNoDataMessage = true;
                  },
                });
            } else {
              console.log('User ID not found.');
            }
            resolve(); // מסיים את ההמתנה
          },
          error: (error) => {
            console.error('Error fetching user data:', error);
            this.showNoDataMessage = true;
            reject(error);
          },
        });
      });
    }
  }

  fetchResourceDetails(resourceId: string, status: string, requestDate:string): void {
    this.apiService.Read(`/EducationalResource/${resourceId}`).subscribe({
      next: (resourceData) => {
        console.log('resourceData', resourceData);

        this.orders.push({
          coverImage: resourceData.coverImage, 
          title: resourceData.title,
          Author: resourceData.author,
          publicationDate: resourceData.publicationDate,
          resourceId: resourceData._id,
          status: status,
          requestDate: requestDate,
        });
      },
      error: (error) =>
        console.error('Error fetching educational resource:', error),
    });
  }

  navigateToItemPage(order: any): void {
    console.log('order', order);

    if (order.resourceId) {
      this.router.navigate(['/item-page', order.resourceId]); // וודא שהשימוש הוא ב _id
    } else {
      console.error('resourceId is undefined or invalid');
    }
  }

  navigateTo(tab: string): void {
    this.activeTab = tab;
    this.router.navigate([`/${tab}`]);
  }

  getStatusInHebrew(status: string): string {
    const statusMap: { [key: string]: string } = {
      Approved: 'מאושר',
      Rejected: 'לא מאושר',
      Pending: 'בהמתנה',
    };
    return statusMap[status] || 'לא ידוע';
  }
  


}
