interface DataType {
  _id: string;
  name: string;
  email: string;
}

// Updates the changes made offline
export async function updateOfflineChange(db: IDBDatabase, change: DataType): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['OfflineChanges'], 'readwrite');
        const store = transaction.objectStore('OfflineChanges');
        store.put(change);  // This will update the record
        transaction.oncomplete = () => {
            resolve();
        };
        transaction.onerror = (event) => {
            reject('Transaction error: ' + (event.target as IDBRequest).error);
        };
    });
}

// Gets the local db
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

// Openes the local db and updates it if necessary
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('Database', 2);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('Tkdathletics')) {
        db.createObjectStore('Tkdathletics', { keyPath: '_id' });
        console.log('Tkdathletics object store created');
      }
      if (!db.objectStoreNames.contains('OfflineChanges')) {
        db.createObjectStore('OfflineChanges', { autoIncrement: true });
        console.log('OfflineChanges object store created');
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB opened successfully');
      console.log('Object stores:', db.objectStoreNames);
      resolve(db);
    };

    request.onerror = (event: Event) => {
      reject('IndexedDB error: ' + (event.target as IDBOpenDBRequest).error);
    };
  });
}

// Stores data in the local db
export function storeDataInIndexedDB(db: IDBDatabase, data: DataType[]): Promise<void> {
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

// Stores the changes made offline the in local db
export async function storeOfflineChange(db: IDBDatabase, change: DataType): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['OfflineChanges'], 'readwrite');
    const store = transaction.objectStore('OfflineChanges');
    store.add(change);
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      reject('Transaction error: ' + (event.target as IDBRequest).error);
    };
  });
}

// Gets the changes made offline from the local db
export async function getOfflineChanges(db: IDBDatabase): Promise<DataType[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['OfflineChanges'], 'readonly');
    const store = transaction.objectStore('OfflineChanges');
    const request = store.getAll();
    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };
    request.onerror = (event) => {
      reject('Transaction error: ' + (event.target as IDBRequest).error);
    };
  });
}

// Clears the offline db after beeing online again
export async function clearOfflineChanges(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['OfflineChanges'], 'readwrite');
    const store = transaction.objectStore('OfflineChanges');
    const request = store.clear();
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      reject('Transaction error: ' + (event.target as IDBRequest).error);
    };
  });
}

// Syncs the changes with the server, pretty explanatory
export async function syncChangeWithServer(change: DataType, id: string): Promise<void> {
  try {
    await fetch(`http://localhost:3890/users/123456/update/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(change)
    });
  } catch (error) {
    console.error('Error syncing with server: ', error);
  }
}

// Just fetches all the users from the server
export async function fetchDataFromServer(): Promise<DataType[]> {
  const response = await fetch('http://localhost:3890/users/123456/getall');
  return response.json();
}
