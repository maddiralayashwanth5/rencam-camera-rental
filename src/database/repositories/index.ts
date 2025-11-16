// Export base repository
export { BaseRepository } from './base.repository';

// Import all repository instances
import { userRepository } from './user.repository';
import { equipmentRepository } from './equipment.repository';
import { bookingRepository } from './booking.repository';
import { reviewRepository } from './review.repository';
import { categoryRepository } from './category.repository';
import { notificationRepository } from './notification.repository';
import { paymentRepository } from './payment.repository';
import { disputeRepository } from './dispute.repository';

// Re-export repository classes
export { UserRepository } from './user.repository';
export { EquipmentRepository } from './equipment.repository';
export { BookingRepository } from './booking.repository';
export { ReviewRepository } from './review.repository';
export { CategoryRepository } from './category.repository';
export { NotificationRepository } from './notification.repository';
export { PaymentRepository } from './payment.repository';
export { DisputeRepository } from './dispute.repository';

// Export all repository instances
export { 
  userRepository,
  equipmentRepository,
  bookingRepository,
  reviewRepository,
  categoryRepository,
  notificationRepository,
  paymentRepository,
  disputeRepository
};

// Repository collection for dependency injection
export const repositories = {
  user: userRepository,
  equipment: equipmentRepository,
  booking: bookingRepository,
  review: reviewRepository,
  category: categoryRepository,
  notification: notificationRepository,
  payment: paymentRepository,
  dispute: disputeRepository
};

export type RepositoryCollection = typeof repositories;
