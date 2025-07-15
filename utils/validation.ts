export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateFarmerData(data: {
  first_name: string;
  last_name: string;
  barangay: string;
  town: string;
  contact_number: string;
  land_area?: string;
  planted_date?: string;
  harvest_date?: string;
}): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.first_name.trim()) {
    errors.push('First name is required');
  }
  if (!data.last_name.trim()) {
    errors.push('Last name is required');
  }
  if (!data.barangay.trim()) {
    errors.push('Barangay is required');
  }
  if (!data.town.trim()) {
    errors.push('Town is required');
  }

  // Contact number validation
  if (data.contact_number && !/^[\d\s\-\+\(\)]+$/.test(data.contact_number)) {
    errors.push('Invalid contact number format');
  }

  // Land area validation
  if (data.land_area && (isNaN(Number(data.land_area)) || Number(data.land_area) < 0)) {
    errors.push('Land area must be a positive number');
  }

  // Date validation
  if (data.planted_date && !isValidDate(data.planted_date)) {
    errors.push('Invalid planted date format (use YYYY-MM-DD)');
  }
  if (data.harvest_date && !isValidDate(data.harvest_date)) {
    errors.push('Invalid harvest date format (use YYYY-MM-DD)');
  }

  // Logical date validation
  if (data.planted_date && data.harvest_date) {
    const plantedDate = new Date(data.planted_date);
    const harvestDate = new Date(data.harvest_date);
    if (harvestDate <= plantedDate) {
      errors.push('Harvest date must be after planted date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUserData(data: {
  username: string;
  password?: string;
  role: string;
}, isEditing: boolean = false): ValidationResult {
  const errors: string[] = [];

  // Username validation
  if (!data.username.trim()) {
    errors.push('Username is required');
  } else if (data.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Password validation (required for new users)
  if (!isEditing && !data.password) {
    errors.push('Password is required');
  } else if (data.password && data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Role validation
  if (!['admin', 'user'].includes(data.role)) {
    errors.push('Invalid role selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}