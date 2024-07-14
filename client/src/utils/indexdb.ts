interface DataType {
  _id: string;
  name: string;
  email: string;
}


export function getDataFromIndexedDB(db: IDBDatabase) {
  return new Promise<DataType[]>((resolve, reject) => {
    const transaction = db.transaction(['Tkdathletics'], 'readonly');
    const store = transaction.objectStore('Tkdathletics');
    const request = store.getAll();
    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };
    request.onerror = (event) => {
      reject('Transaction error: ' + ((event.target as IDBOpenDBRequest).error));
    };
  });
}

export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Database', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('Tkdathletics', { keyPath: '_id' });
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error);
    };
  });
}

// Function to store data in IndexedDB
export function storeDataInIndexedDB(db: IDBDatabase, data: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['Tkdathletics'], 'readwrite');
    const store = transaction.objectStore('Tkdathletics');
    data.forEach(item => store.put(item));
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      reject('Transaction error: ' + (event.target as IDBRequest).error);
    };
  });
}
