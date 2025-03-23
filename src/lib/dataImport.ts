import { Database } from 'sqlite3';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';

export const parseSwiftCodes = (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = path.resolve(__dirname, '../Interns_2025_SWIFT_CODES.xlsx');
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Parsed ${data.length} SWIFT code entries`);
    
    const insertQuery = `
      INSERT OR IGNORE INTO swift_codes (
        swift_code, country_iso2, code_type, bank_name, address, town_name, country_name,
        time_zone, is_headquarter, headquarter_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(new Error(`Failed to begin transaction: ${err.message}`));
          return;
        }
        
        const stmt = db.prepare(insertQuery, (err) => {
          if (err) {
            reject(new Error(`Failed to prepare statement: ${err.message}`));
            return;
          }
        });
        
        data.forEach((row: any, index: number) => {
          const swiftCode = row['SWIFT CODE'];
          
          if(!swiftCode || !row['COUNTRY ISO2 CODE'] || !row['NAME']) {
            console.warn(`Row ${index + 1} truly missing SWIFT CODE:`, JSON.stringify(row));
            return;
          }

          if (swiftCode.length !== 8 && swiftCode.length !== 11) {
            console.warn(`Invalid SWIFT CODE length at row ${index + 1}: ${swiftCode}`);
            return;
          }
          
          const isHeadquarter = swiftCode.endsWith('XXX');
          let headquarterCode = null;
          
          if (!isHeadquarter && swiftCode.length >= 8) {
            headquarterCode = swiftCode.substring(0, 8) + 'XXX';
          }
          
          const countryISO2 = (row['COUNTRY ISO2 CODE'] || '').toUpperCase();
          const countryName = (row['COUNTRY NAME'] || '').toUpperCase();
          
          stmt.run(
            swiftCode,
            countryISO2,
            row['CODE TYPE'],
            row['NAME'],
            row['ADDRESS'] || null,
            row['TOWN NAME'],
            countryName,
            row['TIME ZONE'],
            isHeadquarter ? 1 : 0,
            headquarterCode,
            (err: Error | null) => {
              if (err) {
                console.error(`Error inserting SWIFT code ${swiftCode}:`, err);
                db.run('ROLLBACK');
                reject(new Error(`Failed to insert SWIFT code ${swiftCode}: ${err.message}`));
                return;
              }
            }
          );
        });
        
        stmt.finalize((err) => {
          if (err) {
            console.error('Error finalizing statement:', err);
            db.run('ROLLBACK');
            reject(new Error(`Failed to finalize statement: ${err.message}`));
            return;
          }
          
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              reject(new Error(`Failed to commit transaction: ${err.message}`));
            } else {
              console.log('SWIFT codes imported successfully');
              resolve();
            }
          });
        });
      });
    });
  });
};