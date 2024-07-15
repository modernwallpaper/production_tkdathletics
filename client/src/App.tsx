import React, { useEffect, useState } from 'react';
import { openIndexedDB, storeDataInIndexedDB, getDataFromIndexedDB } from './utils/indexdb';
import PWABadge from './PWABadge';

interface DataType {
  _id: string;
  name: string;
  email: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<DataType[]>([])

  useEffect(() => {
    const fetchDataAndStoreInIndexedDB = async () => {
      try {
        let db = await openIndexedDB();

        if (navigator.onLine) {
          const response = await fetch('http://localhost:3890/users/123456/getall');
          const data = await response.json();
          await storeDataInIndexedDB(db, data);
          setData(data);
          console.log('Data successfully stored in IndexedDB');
        } else {
          const data = await getDataFromIndexedDB(db);
          setData(data);
          console.log('Data loaded from IndexedDB');
        }
      } catch (error) {
        console.error('Error fetching and storing data: ', error);
      }
    };

    fetchDataAndStoreInIndexedDB();
  }, []);

  return (
    <div>
      <h1>FETCHED DATABASE:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <PWABadge />
    </div>
  );
};

export default App;
