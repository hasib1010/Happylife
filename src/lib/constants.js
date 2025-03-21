// src/lib/constants.js
/**
 * Application constants that can be shared between client and server
 * This file is used to avoid circular imports and to make constants available in edge runtime
 */

// Define user roles
export const ROLES = {
    REGULAR: 'regular',
    PROVIDER: 'provider',
    PRODUCT_SELLER: 'product_seller',
    MANAGER: 'manager',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  };
  
  // Define permission levels
  export const PERMISSIONS = {
    READ_ONLY: 'read_only',
    MANAGE_OWN: 'manage_own',
    MANAGE_ALL: 'manage_all',
    FULL_ACCESS: 'full_access'
  };
  
  // Default role permissions mapping
  export const DEFAULT_ROLE_PERMISSIONS = {
    [ROLES.REGULAR]: {
      users: PERMISSIONS.MANAGE_OWN,
      content: PERMISSIONS.READ_ONLY,
      products: PERMISSIONS.READ_ONLY,
      services: PERMISSIONS.READ_ONLY,
      bookings: PERMISSIONS.MANAGE_OWN,
      analytics: PERMISSIONS.READ_ONLY
    },
    [ROLES.PROVIDER]: {
      users: PERMISSIONS.MANAGE_OWN,
      content: PERMISSIONS.READ_ONLY,
      products: PERMISSIONS.READ_ONLY,
      services: PERMISSIONS.MANAGE_OWN,
      bookings: PERMISSIONS.MANAGE_OWN,
      analytics: PERMISSIONS.MANAGE_OWN
    },
    [ROLES.PRODUCT_SELLER]: {
      users: PERMISSIONS.MANAGE_OWN,
      content: PERMISSIONS.READ_ONLY,
      products: PERMISSIONS.MANAGE_OWN,
      services: PERMISSIONS.READ_ONLY,
      bookings: PERMISSIONS.MANAGE_OWN,
      analytics: PERMISSIONS.MANAGE_OWN
    },
    [ROLES.MANAGER]: {
      users: PERMISSIONS.MANAGE_ALL,
      content: PERMISSIONS.MANAGE_ALL,
      products: PERMISSIONS.MANAGE_ALL,
      services: PERMISSIONS.MANAGE_ALL,
      bookings: PERMISSIONS.MANAGE_ALL,
      analytics: PERMISSIONS.MANAGE_ALL
    },
    [ROLES.ADMIN]: {
      users: PERMISSIONS.FULL_ACCESS,
      content: PERMISSIONS.FULL_ACCESS,
      products: PERMISSIONS.FULL_ACCESS,
      services: PERMISSIONS.FULL_ACCESS,
      bookings: PERMISSIONS.FULL_ACCESS,
      analytics: PERMISSIONS.FULL_ACCESS
    },
    [ROLES.SUPER_ADMIN]: {
      users: PERMISSIONS.FULL_ACCESS,
      content: PERMISSIONS.FULL_ACCESS,
      products: PERMISSIONS.FULL_ACCESS,
      services: PERMISSIONS.FULL_ACCESS,
      bookings: PERMISSIONS.FULL_ACCESS,
      analytics: PERMISSIONS.FULL_ACCESS,
      system: PERMISSIONS.FULL_ACCESS  // Only super_admin has system level access
    }
  };
  
  // Map legacy accountType to role (for backward compatibility)
  export function mapAccountTypeToRole(accountType) {
    switch (accountType) {
      case 'admin':
        return ROLES.ADMIN;
      case 'provider':
        return ROLES.PROVIDER;
      case 'product_seller':
        return ROLES.PRODUCT_SELLER;
      default:
        return ROLES.REGULAR;
    }
  }
  
  // Map role to legacy accountType (for backward compatibility)
  export function mapRoleToAccountType(role) {
    switch (role) {
      case ROLES.ADMIN:
      case ROLES.SUPER_ADMIN:
      case ROLES.MANAGER:
        return 'admin';
      case ROLES.PROVIDER:
        return 'provider';
      case ROLES.PRODUCT_SELLER:
        return 'product_seller';
      default:
        return 'regular';
    }
  }