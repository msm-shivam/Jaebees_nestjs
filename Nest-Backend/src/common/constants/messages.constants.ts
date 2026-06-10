export const AuthMessages = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified.',
  OTP_SENT: 'OTP has been sent to your email.',
  OTP_INVALID: 'Invalid or expired OTP.',
  OTP_VERIFIED: 'OTP verified successfully.',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully.',
  TOKEN_INVALID: 'Invalid or expired token.',
  UNAUTHORIZED: 'Unauthorized access.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Session has expired. Please login again.',
};

export const UserMessages = {
  USER_NOT_FOUND: 'User not found.',
  EMAIL_TAKEN: 'An account with this email already exists.',
  MOBILE_TAKEN: 'An account with this mobile number already exists.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
};

export const AdminMessages = {
  ADMIN_NOT_FOUND: 'Admin user not found.',
  EMAIL_TAKEN: 'An admin account with this email already exists.',
  DELETE_FAILED: 'Failed to delete admin user.',
};

export const RbacMessages = {
  ROLE_NOT_FOUND: 'Role not found.',
  PERMISSION_NOT_FOUND: 'Permission not found.',
  ROLE_ALREADY_EXISTS: 'A role with this slug already exists.',
  PERMISSION_ALREADY_EXISTS: 'A permission with this slug already exists.',
  ROLE_ASSIGNED: 'Role assigned successfully.',
  ROLE_REVOKED: 'Role revoked successfully.',
};

export const CatalogMessages = {
  BRAND_NOT_FOUND: 'Brand not found.',
  BRAND_SLUG_EXISTS: 'A brand with this slug already exists.',
  CATEGORY_NOT_FOUND: 'Category not found.',
  CATEGORY_SLUG_EXISTS: 'A category with this slug already exists.',
  SUB_CATEGORY_NOT_FOUND: 'Sub category not found.',
  SUB_CATEGORY_SLUG_EXISTS: 'A sub category with this slug already exists.',
  COLLECTION_NOT_FOUND: 'Collection not found.',
  COLLECTION_SLUG_EXISTS: 'A collection with this slug already exists.',
  ATTRIBUTE_NOT_FOUND: 'Attribute not found.',
  ATTRIBUTE_SLUG_EXISTS: 'An attribute with this slug already exists.',
  ATTRIBUTE_VALUE_NOT_FOUND: 'Attribute value not found.',
  ATTRIBUTE_VALUE_SLUG_EXISTS:
    'An attribute value with this slug already exists for this attribute.',
  TAG_NOT_FOUND: 'Product tag not found.',
  TAG_SLUG_EXISTS: 'A product tag with this slug already exists.',
};
