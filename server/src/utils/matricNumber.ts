// src/utils/matricNumber.ts
export function generateMatricNumber(cohortNumber: number, userIndex: number): string {
  const cohortStr = String(cohortNumber).padStart(2, '0');
  const userStr = String(userIndex).padStart(3, '0');
  return `${cohortStr}${userStr}`;
}