import { Database } from 'sqlite3'

export const initializeDatabase = (): Promise<Database> => {
    return new Promise((resolve, reject) => {
        const db = new Database('db.sqlite',(err) => {
            if(err) {
                console.error('Error opening a database: ', err);
                reject(err);
                return;
              }

              console.log('Database connected');
              createTables(db)
                .then(() => checkAndImportData(db))
                .then(() => resolve(db))
                .catch(reject)
        });
    });
};

const createTables = (db: Database): Promise<void> => {
    return new Promise((resolve,reject) => {
        db.run(`
        CREATE TABLE IF NOT EXISTS swift_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            swift_code TEXT UNIQUE NOT NULL,
            country_iso2 TEXT NOT NULL,
            code_type TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            address TEXT,
            town_name TEXT NOT NULL,
            country_name TEXT NOT NULL,
            time_zone TEXT NOT NULL,
            is_headquarter BOOLEAN NOT NULL,
            headquarter_code TEXT,
            FOREIGN KEY (headquarter_code) REFERENCES swift_codes(swift_code)
        )
        `, (err) => {
            if(err) {
                console.error('Error creating table', err);
                reject(err);
            }
            else {
                console.log('Table created or already exists');
                resolve();
            }
        });
    });
};

const checkAndImportData = (db: Database): Promise<void> => {
    return new Promise((resolve,reject) => {
        db.get('SELECT COUNT(*) as count FROM swift_codes', (err, row: any) => {
            if(err) {
                console.error('Error checking data', err);
                reject(err);
            } else if(row.count == 0) {
                import('./dataImport').then(({parseSwiftCodes}) => {
                    parseSwiftCodes(db)
                        .then(resolve)
                        .catch(reject)
                });
            } else {
                resolve();
            }
        });
    });
};

export const getDatabase = (): Promise<Database> => {
    return initializeDatabase();
}