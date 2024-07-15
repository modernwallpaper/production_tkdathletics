import React, { useEffect, useState } from 'react';
import {
  openIndexedDB,
  storeDataInIndexedDB,
  getDataFromIndexedDB,
  storeOfflineChange,
  getOfflineChanges,
  clearOfflineChanges,
  syncChangeWithServer,
  fetchDataFromServer,
  updateOfflineChange,
} from './utils/indexdb';
import PWABadge from './PWABadge';

interface DataType {
  _id: string;
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);

  useEffect(() => {
    const fetchDataAndStoreInIndexedDB = async () => {
      let db = await openIndexedDB();

      if (navigator.onLine) {
        // Fetch data from the server
        const data = await fetchDataFromServer();
        // Get any offline changes
        const offlineChanges = await getOfflineChanges(db);

        // Merge offline changes into the fetched data
        const mergedData = data.map(user => {
          const offlineChange = offlineChanges.find(change => change._id === user._id);
          return offlineChange ? { ...user, ...offlineChange } : user;
        });

        // Store merged data in IndexedDB
        await storeDataInIndexedDB(db, mergedData);
        setData(mergedData);
        console.log('Data successfully stored in IndexedDB');

        // Clear offline changes
        await clearOfflineChanges(db);
      } else {
        // Load data from IndexedDB
        const data = await getDataFromIndexedDB(db);
        setData(data);
        console.log('Data loaded from IndexedDB');
      }
    };

    fetchDataAndStoreInIndexedDB();
  }, []);

  const handleChange = async (newData: DataType) => {
    let db = await openIndexedDB();
    if (navigator.onLine) {
      await syncChangeWithServer(newData, newData._id);
      const updatedData = await fetchDataFromServer();
      await storeDataInIndexedDB(db, updatedData);
      setData(updatedData);
    } else {
      const offlineChanges = await getOfflineChanges(db);
      const existingChange = offlineChanges.find(change => change._id === newData._id);

      if (existingChange) {
        // Update the existing change
        await updateOfflineChange(db, newData);
      } else {
        // Add new change
        await storeOfflineChange(db, newData);
      }

      // Optionally, update the local state to reflect changes immediately
      const updatedData = data.map(user => user._id === newData._id ? newData : user);
      setData(updatedData);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const id = (form.elements.namedItem('id') as HTMLInputElement).value;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;

    const newData: DataType = { _id: id, name, email };
    await handleChange(newData);
  };

  return (
    <div>
      <h1>FETCHED DATABASE USERS:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <form onSubmit={handleSubmit}>
        <input name='id' placeholder='id' />
        <input name='name' placeholder='name' />
        <input name='email' placeholder='email' />
        <button type='submit'>Update</button>
      </form>
      <PWABadge />
    </div>
  );
};

export default App;
