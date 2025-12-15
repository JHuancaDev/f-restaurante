import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Review } from '../../models/review-m';
import { ReviewService } from '../../service/review-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-reviews',
  imports: [
    ToastModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    CommonModule,
    FormsModule,
    TableModule,
    RatingModule,
    TagModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    ProgressBarModule,
    ProgressSpinnerModule
  ],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class Reviews implements OnInit{
  reviews: Review[] = [];
  selectedReview: Review | null = null;
  displayEditDialog: boolean = false;
  displayStatsDialog: boolean = false;
  loading: boolean = false;
  approvedOnly: boolean = false;

  // Para estadísticas
  productStats: any = null;
  loadingStats: boolean = false;

  constructor(
    private reviewAdminService: ReviewService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.reviewAdminService.getAllReviews(0, 100, this.approvedOnly).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las reseñas'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onApprovedOnlyChange() {
    this.loadReviews();
  }

  approveReview(review: Review) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres aprobar la reseña de ${review.user_name}?`,
      header: 'Confirmar Aprobación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reviewAdminService.approveReview(review.id).subscribe({
          next: (updatedReview) => {
            review.is_approved = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Reseña aprobada correctamente'
            });
          },
          error: (error) => {
            console.error('Error approving review:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al aprobar la reseña'
            });
          }
        });
      }
    });
  }

  editReview(review: Review) {
    this.selectedReview = { ...review };
    this.displayEditDialog = true;
  }

  saveReview() {
    if (!this.selectedReview) return;

    const updateData = {
      rating: this.selectedReview.rating,
      comment: this.selectedReview.comment,
      is_approved: this.selectedReview.is_approved
    };

    this.reviewAdminService.updateReview(this.selectedReview.id, updateData).subscribe({
      next: (updatedReview) => {
        const index = this.reviews.findIndex(r => r.id === updatedReview.id);
        if (index !== -1) {
          this.reviews[index] = { ...this.reviews[index], ...updatedReview };
        }
        this.displayEditDialog = false;
        this.selectedReview = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reseña actualizada correctamente'
        });
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la reseña'
        });
      }
    });
  }

  deleteReview(review: Review) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la reseña de ${review.user_name}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.reviewAdminService.deleteReview(review.id).subscribe({
          next: () => {
            this.reviews = this.reviews.filter(r => r.id !== review.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Reseña eliminada correctamente'
            });
          },
          error: (error) => {
            console.error('Error deleting review:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la reseña'
            });
          }
        });
      }
    });
  }

  showProductStats(review: Review) {
    this.loadingStats = true;
    this.displayStatsDialog = true;

    this.reviewAdminService.getProductStats(review.product_id).subscribe({
      next: (stats) => {
        this.productStats = stats;
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las estadísticas'
        });
        this.loadingStats = false;
      }
    });
  }

  getSeverity(isApproved: boolean): 'success' | 'warning' {
    return isApproved ? 'success' : 'warning';
  }

  getStatusText(isApproved: boolean): string {
    return isApproved ? 'Aprobado' : 'Pendiente';
  }
}
