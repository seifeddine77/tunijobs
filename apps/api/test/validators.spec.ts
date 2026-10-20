import { isValidTunisianPhone, isValidTunisianTaxId, formatTND } from '@tunijobs/shared-types';

describe('Tunisian Validation Helpers', () => {
  describe('isValidTunisianPhone', () => {
    it('should validate valid Tunisian phone numbers', () => {
      expect(isValidTunisianPhone('+21698123456')).toBe(true);
      expect(isValidTunisianPhone('+216 20 111 222')).toBe(true);
      expect(isValidTunisianPhone('55123456')).toBe(true);
      expect(isValidTunisianPhone('71860000')).toBe(true);
      expect(isValidTunisianPhone('44123456')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidTunisianPhone('01234567')).toBe(false); // Commence par 0
      expect(isValidTunisianPhone('+33612345678')).toBe(false); // France
      expect(isValidTunisianPhone('1234')).toBe(false); // Trop court
    });
  });

  describe('isValidTunisianTaxId', () => {
    it('should validate standard Tunisian Matricule Fiscal formats', () => {
      expect(isValidTunisianTaxId('1234567A/A/M/000')).toBe(true);
      expect(isValidTunisianTaxId('7654321B/B/M/000')).toBe(true);
      expect(isValidTunisianTaxId('0987654Z/P/C/123')).toBe(true);
    });

    it('should reject invalid Matricule Fiscal formats', () => {
      expect(isValidTunisianTaxId('123456')).toBe(false); // Trop court
      expect(isValidTunisianTaxId('ABCDEFG/A/A/000')).toBe(false); // Pas de chiffres
      expect(isValidTunisianTaxId('1234567A-A-M-000')).toBe(false); // Mauvais séparateur
    });
  });

  describe('formatTND', () => {
    it('should format currency correctly with TND', () => {
      const formatted = formatTND(2500);
      expect(formatted).toContain('2');
      expect(formatted).toContain('500');
    });
  });
});
