import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// פונקציה לבדיקת ת.ז ישראלית
function isIsraeliIdNumber(id: string): boolean {
  id = String(id).trim();
  if (id.length > 9 || isNaN(Number(id))) return false;
  id = id.length < 9 ? ("00000000" + id).slice(-9) : id;
  return (
    Array.from(id, Number).reduce((counter, digit, i) => {
      const step = digit * ((i % 2) + 1);
      return counter + (step > 9 ? step - 9 : step);
    }, 0) %
      10 ===
    0
  );
}

// Validator מותאם אישית
export function israeliIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // אם השדה ריק, אין שגיאה (תתבצע בדיקה נפרדת אם השדה נדרש)
    }

    const isValid = isIsraeliIdNumber(value);
    console.log('isValid', isValid);
    
    return isValid ? null : { invalidId: true }; // מחזיר שגיאה אם הת.ז לא תקין
  };
}
