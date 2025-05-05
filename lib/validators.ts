// Simple email validation
export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Age range validation
  export const validateAge = (age: number): boolean => {
    return age >= 1 && age <= 120;
  };
  
  // Password strength validation (optional)
  export const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };
  
  // Blood type validation (optional)
  export const validateBloodType = (bloodType: string): boolean => {
    return /^(A|B|AB|O)[+-]$/.test(bloodType);
  };